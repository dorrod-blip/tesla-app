import axios from 'axios';
import { useEffect, useState } from 'react'
import { useLocalStorage } from 'usehooks-ts';

type InvoiceProps = {
    showModal: boolean,
    setShowModal: any,
    vinId: string,
}
type IParameterInterface = {
    startTime: string,
    endTime: string,
    vin: string,
}
type InvoiceInterface = {
    id: string,
    fileName: string,
    startTime: string,
    endTime: string,
}


const Invoice = ({ showModal, setShowModal, vinId }: InvoiceProps) => {
    const [submitLoading, setSubmitLoading] = useState<boolean>(false)
    const [contentId, setContentId] = useState("");
    const [accessToken, setAccessToken] = useLocalStorage("access_token", "");
    const [timezone, setTimezone] = useState(":00-07:00");
    const [parameters, setParameters] = useState<IParameterInterface | any>({
        startTime: "",
        endTime: "",
        vin: vinId,
    });

    const [invoices, setInvoices] = useState<InvoiceInterface[]>([]);

    const [errors, setErrors] = useState<IParameterInterface | any>({
        startTime: "",
        endTime: "",
        vin: "",
    });

    const OnFormInputChange = (e: any) => {
        const { name, value } = e.target;
        setParameters({
            ...parameters,
            [name]: value,
        });
        setErrors({
            ...errors,
            [name]: "",
        });
    };

    const handleChargeHistory = async (e:any) => {
        e.preventDefault()
        const fields = ["startTime", "endTime"];
        let customError: any = {};
        for (const field of fields) {
            if (field !== 'notes' && !parameters[field] ) {
                customError[field] = `${field.toLocaleUpperCase()} is required.`;
            }
        }
        if (Object.keys(customError).length) {
            setErrors(customError);
            return;
        }

        console.log(`${process.env.REACT_APP_BACKEND_API}/dashboard/charging?access_token=${accessToken}&vin=${vinId}&start=${parameters.startTime}${timezone}&end=${parameters.endTime}${timezone}`);

        setSubmitLoading(true);
        try {
            const result: any = await axios.get(
                `${process.env.REACT_APP_BACKEND_API}/dashboard/charging?access_token=${accessToken}&vin=${vinId}&startTime=${parameters.startTime}${timezone}&endTime=${parameters.endTime}${timezone}`
            );
            if(result){
                // setShowModal(false)
                setSubmitLoading(false);
                const history = result.data.data;
                const extractedData = (Array.isArray(history) ? history : []).map((item) => {
                    const { chargeStartDateTime, chargeStopDateTime, invoices } = item;
                
                    return {
                        invoices: Array.isArray(invoices) ? invoices.map((invoice) => ({
                            id: invoice.contentId,
                            fileName: invoice.fileName,
                            startTime: chargeStartDateTime,
                            endTime: chargeStopDateTime,
                        })) : [],
                    };
                });
                
                setInvoices(extractedData.flatMap((item) => item.invoices));

                console.log("extractedData: ", extractedData);
            }
        } catch (error:any) {
            console.log("get charging history error: ", error);  
            setShowModal(false)
        }
    };

    useEffect(() => {
        console.log("invoices: ", invoices);
    }, [invoices]);

    const getInvoice = async (id: string) => {
        try {
            console.log("get invoice: ", id);
            const result: any = await axios.get(
                `${process.env.REACT_APP_BACKEND_API}/dashboard/invoice?access_token=${accessToken}&id=${id}`, {
                    responseType: 'blob',
                    headers: {
                        'Accept': 'application/pdf',
                    }
                }
            );

            console.log("invoice data: ", result.data);
            const url = window.URL.createObjectURL(new Blob([result.data]));

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'downloadedFile.pdf');

            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.log("get invoice error: ", error);
        }
    };
    
    return (
        <div className={`${!showModal ? 'hidden' : ''}fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full`}>
            <div className="relative w-full max-w-2xl max-h-full h-[100vh] flex items-center m-auto ">
                <div className="relative w-full bg-white rounded-lg shadow dark:bg-gray-700">
                    <div className="flex items-start justify-between p-4 rounded-t">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            SuperCharger Invoice
                        </h3>
                        <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="defaultModal">
                            <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                            </svg>
                        </button>
                    </div>
                    <div className="p-6 space-y-6">
                        <p className='text-left'>Vin: {vinId}</p>
                        <p className='text-left'>Invoices</p>
                        {   
                            invoices.length &&
                            <div className="max-h-[300px] relative overflow-y-auto overflow-x-auto rounded-xl">
                                <div className="my-8 shadow-sm">
                                    <table className="w-full text-sm border-collapse table-fixed">
                                        <thead>
                                            <th rowSpan={1} className="p-4 pt-0 pb-3 pl-8 font-medium text-center border-b dark:border-slate-600 text-slate-400 dark:text-slate-200 w-[50px]">No</th>
                                            <th colSpan={1} className="p-4 pt-0 pb-3 pr-8 font-medium text-center border-b dark:border-slate-600 text-slate-400 dark:text-slate-200 w-[200px]">Id</th>
                                            <th colSpan={1} className="p-4 pt-0 pb-3 pr-8 font-medium text-center border-b dark:border-slate-600 text-slate-400 dark:text-slate-200 w-[200px]">FileName</th>
                                            <th colSpan={1} className="p-4 pt-0 pb-3 pr-8 font-medium text-center border-b dark:border-slate-600 text-slate-400 dark:text-slate-200 w-[200px]">Start</th>
                                            <th colSpan={1} className="p-4 pt-0 pb-3 pr-8 font-medium text-center border-b dark:border-slate-600 text-slate-400 dark:text-slate-200 w-[200px]">End</th>
                                            <th colSpan={1} className="p-4 pt-0 pb-3 pr-8 font-medium text-center border-b dark:border-slate-600 text-slate-400 dark:text-slate-200 w-[200px]">Invoice</th>
                                        </thead>
                                        <tbody className="bg-white dark:bg-slate-800">
                                            {
                                                invoices.map((invoice: any, i: number) => (
                                                    <tr key={i}>
                                                        <td className="p-4 pl-8 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400">{i + 1}.</td>
                                                        <td className="p-4 pr-8 text-center border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400">{invoice?.id ?? 'N/A'}</td>
                                                        <td className="p-4 pr-8 text-center border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400">{invoice?.fileName ?? 'N/A' }</td>
                                                        <td className="p-4 pr-8 text-center border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400">{invoice?.startTime ?? 'N/A' }</td>
                                                        <td className="p-4 pr-8 text-center border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400">{invoice?.endTime ?? 'N/A' }</td>
                                                        <td className="p-4 pr-8 text-center border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400"> 
                                                                <div className="flex gap-2 p-4 pl-8">
                                                                    <button onClick={() => getInvoice(invoice?.id)} className="px-3 text-sm font-semibold text-green-600 rounded cursor-pointer lg:px-4 dark:text-green-500 hover:underline"
                                                                    >Invoice</button>
                                                                </div>
                                                            </td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        }
                        <form onSubmit={handleChargeHistory}>
                            <div className="flex flex-col justify-between items-start mb-5">
                                <label className="w-40 text-justify mb-4">Start Time:<span className='text-sm text-red-500'>*</span></label>
                                <input
                                    type="datetime-local"
                                    id="datetime"
                                    autoComplete="off"
                                    name="startTime"
                                    value={parameters.startTime}
                                    onChange={OnFormInputChange}
                                    className="rounded-lg h-[20px] w-full py-5 px-5 mb-4 items-center border-solid border-2 border-grey focus:outline-none" />
                                    <span className="mt-2 text-sm text-red-500 dark:text-red-400">{errors?.startTime}</span>
                            </div>
                            <div className="flex flex-col justify-between items-start mb-5">
                                <label className="w-40 text-justify mb-4">End Time:<span className='text-sm text-red-500'>*</span></label>
                                <input
                                    type="datetime-local"
                                    id="datetime"
                                    autoComplete="off"
                                    name="endTime"
                                    value={parameters.endTime}
                                    onChange={OnFormInputChange}
                                    className="rounded-lg h-[20px] w-full py-5 px-5 mb-4 items-center border-solid border-2 border-grey focus:outline-none" />
                                    <span className="mt-2 text-sm text-red-500 dark:text-red-400">{errors?.endTime}</span>
                            </div>
                            
                            
                            <div className="mt-12">
                                <button type='submit' className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Invoice