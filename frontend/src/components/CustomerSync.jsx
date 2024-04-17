import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import Button from "react-bootstrap/Button";
import {countCustomers, updateSyncCustomer} from "../features/customer/customerSlice";
import {ProgressBar} from "react-bootstrap";

const CustomerSync = () => {
    const {syncObj} = useSelector((state) => state.customer);
    const dispatch = useDispatch();

    useEffect(() => {
        if (syncObj.playing) dispatch(countCustomers());
    }, [dispatch, syncObj.playing])


    const resetSyncCustomer = () => {
        dispatch(updateSyncCustomer({name: "page", value: 1}))
        dispatch(updateSyncCustomer({name: "total_customers", value: 0}))
        dispatch(updateSyncCustomer({name: "synced_customers", value: 0}))
        dispatch(updateSyncCustomer({name: "synced_percent", value: 0}))
        dispatch(updateSyncCustomer({name: "playing", value: false}));

    }

    const startSyncCustomer = () => {
        resetSyncCustomer()
        dispatch(updateSyncCustomer({name: "playing", value: true}));
    }

    const resumeSyncCustomer = () => {
        dispatch(updateSyncCustomer({name: "page", value: syncObj.page + 1}))
        dispatch(updateSyncCustomer({name: "playing", value: true}));
    }

    const pauseSyncCustomer = () => {
        dispatch(updateSyncCustomer({name: "playing", value: false}));
    }

    return (
        <>
            <div className={"border-opacity-25 p-4 border-dark border"}>
                <h3 className={"border-bottom border-dark-subtle mb-4 pb-4"}>Customer</h3>
                <div className={"d-flex pt-3 pb-3  flex-row align-items-center"}>

                    <div className={"mb-3"}>
                        {syncObj.playing ?
                            <Button variant={"warning"} onClick={pauseSyncCustomer}>Pause</Button> :
                            syncObj.page > 1 ?
                                <Button variant={"success"} onClick={resumeSyncCustomer}>Resume</Button>
                                :
                                <Button variant={"primary"} onClick={startSyncCustomer}>Start</Button>
                        }
                        <Button className={"ms-2"} onClick={resetSyncCustomer} variant={"danger"}>Reset</Button>
                    </div>
                </div>
                <div className={"mb-2"}>
                    <span>Synced {syncObj.synced_customers} of total {syncObj.total_customers} customers</span>
                </div>
                <ProgressBar striped variant="success" now={syncObj.synced_percent}
                             label={`${Math.round(syncObj.synced_percent)}%`}/>
            </div>
        </>
    );
};

export default CustomerSync;
