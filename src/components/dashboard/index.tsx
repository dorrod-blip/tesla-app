import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useLocalStorage } from "../../hooks/useLocalstorage";
import withAuth from "../../hoc/with-auth-redirect";

const Dashboard = () => {
    const [profile] = useLocalStorage<any>("profile", {});
    const [showModal, setShowModal] = useState<boolean>(false)
    const [portals, setPortals] = useState([]);
    const [projects, setProjects] = useState([]);
    const [projectData, setProjectData] = useState({});
    const [lists, setLists] = useState([]);
    
    // new changes
    
    const navigate = useNavigate();
    const [accessToken, setAccessToken] = useLocalStorage("access_token", "");
    const [vins, setVins] = useState<any>([]);
    const [vehicles, setVehicles] = useState<any>([]);
    const [isLoggedIn, setIsLoggedIn] = useLocalStorage( "isLoggedIn", false);

    const getVins = async () => {
        try {
            const result: any = await axios.get(
                `${process.env.REACT_APP_BACKEND_API}/dashboard/vins/all?access_token=${accessToken}`
            );
            if (result) {
                let vins: any = []
                vins = result.data;
                console.log("vins: ", vins);
                return vins;
            }
        } catch (error) { 
            console.log("get vins error: ", error);  
        }
    }

    const getVehicles = async () => {
        try {
            if (!vins || vins.length === 0) {
                throw new Error("No VINs provided");
            }
    
            const vehiclePromises = vins.map((item: { id: string }) => {
                const params = {
                    access_token: accessToken,
                    id: item.id,
                };
    
                return axios.get(
                    `${process.env.REACT_APP_BACKEND_API}/dashboard/vehicle/`,
                    { params }
                ).then(response => response.data);
            });
    
            const vehicles = await Promise.all(vehiclePromises);
            console.log('vehicle: ', vehicles);
            return vehicles;
        } catch (error) {
            console.error("Error fetching vehicles:", error);
            throw error;
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false)
        localStorage.clear()
    }

    const register = async () => {
        try {
            const result: any = await axios.get(`${process.env.REACT_APP_BACKEND_API}/auth/register`);
            console.log('access_token', result.data);
            if (result?.data.public_key) {
                navigate("/");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const lock = async (vin: any) => {
        try {
            const result: any = await axios.get(
                `${process.env.REACT_APP_BACKEND_API}/dashboard/lock?access_token=${accessToken}&vin=${vin}`
            );
            console.log("lock: ", result);
            if (result?.data.result) {
                console.log("lock data: ", result.data);
                vehicles.map((item: any) => {
                    if (item.vin == vin) {
                        item.isLocked = true;
                        return;
                    }
                });
                setVehicles(vehicles);
            }
        } catch (error) { 
            console.log("lock error: ", error);  
        }
    }

    const unlock = async (vin: any) => {
        try {
            const result: any = await axios.get(
                `${process.env.REACT_APP_BACKEND_API}/dashboard/unlock?access_token=${accessToken}&vin=${vin}`
            );
            console.log("unlock: ", result);
            if (result?.data.result) {
                console.log("unlock data: ", result.data);
                vehicles.map((item: any) => {
                    if (item.vin == vin) {
                        item.isLocked = false;
                        console.log("a vehicle: ", item);
                        return;
                    }
                });
                setVehicles(vehicles);
            }
        } catch (error) { 
            console.log("unlock error: ", error);  
        }
    }

    const keyPairing = () => {
        window.open('https://www.tesla.com/_ak/tesla-vehicle-app.vercel.app');
    }

    useEffect(() => {
        const updateVins = async () => {
            const vins = await getVins();
            setVins(vins);
        }
        updateVins();
    }, []);

    useEffect(() => {
        const updateVehicle = async() => {
            const vehicles = await getVehicles();
            setVehicles(vehicles);
        }
        updateVehicle();
    }, [vins]);

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-between w-full max-w-2xl mt-8">
                <button className="px-3 py-2 text-sm font-semibold text-white bg-blue-500 rounded lg:px-4 hover:bg-blue-600" onClick={register}>Register Domain</button>
                <button className="px-3 py-2 text-sm font-semibold text-white bg-blue-500 rounded lg:px-4 hover:bg-blue-600" onClick={keyPairing}>Key Pairing</button>
                <button className="px-3 py-2 text-sm font-semibold text-white bg-blue-500 rounded lg:px-4 hover:bg-blue-600" onClick={handleLogout}>Logout</button>
            </div>
            <div>
                <div className="max-w-[80%] m-auto mt-10">
                    <div className="relative overflow-hidden not-prose bg-slate-50 rounded-xl dark:bg-slate-800/25">
                        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
                                <div className="relative overflow-auto rounded-xl">
                                    <div className="my-8 shadow-sm">
                                        <table className="w-full text-sm border-collapse table-fixed">
                                            <thead>
                                                <th rowSpan={1} className="p-4 pt-0 pb-3 pl-8 font-medium text-center border-b dark:border-slate-600 text-slate-400 dark:text-slate-200 w-[50px]">No</th>
                                                <th colSpan={1} className="p-4 pt-0 pb-3 pr-8 font-medium text-center border-b dark:border-slate-600 text-slate-400 dark:text-slate-200 w-[200px]">Vin</th>
                                                <th colSpan={1} className="p-4 pt-0 pb-3 pr-8 font-medium text-center border-b dark:border-slate-600 text-slate-400 dark:text-slate-200 w-[200px]">Status</th>
                                                <th colSpan={1} className="p-4 pt-0 pb-3 pr-8 font-medium text-center border-b dark:border-slate-600 text-slate-400 dark:text-slate-200 w-[200px]">Lock/Unlock</th>
                                            </thead>
                                            <tbody className="bg-white dark:bg-slate-800">
                                                {
                                                    vehicles.length && vehicles.map((vehicle: any, i: number) => (
                                                        <tr key={i}>
                                                            <td className="p-4 pl-8 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400">{i + 1}.</td>
                                                            <td className="p-4 pr-8 text-center border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400">{vehicle?.vin ?? 'N/A'}</td>
                                                            <td className="p-4 pr-8 text-center border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400">{vehicle?.isLocked ? 'locked' : 'unlocked' }</td>
                                                            <td className="p-4 pr-8 text-center border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400"> 
                                                                <div className="flex gap-2 p-4 pl-8">
                                                                    <button
                                                                    onClick={() => {
                                                                        if (vehicle?.isLocked) {
                                                                            unlock(vehicle?.vin)
                                                                        } else {
                                                                            lock(vehicle?.vin)
                                                                        }
                                                                    }}
                                                                    className="px-3 text-sm font-semibold text-green-600 rounded cursor-pointer lg:px-4 dark:text-green-500 hover:underline"
                                                                    >{vehicle?.isLocked ? 'Unlock' : 'Lock'}</button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                        <div className="absolute inset-0 border pointer-events-none border-black/5 rounded-xl dark:border-white/5"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default withAuth(Dashboard);
