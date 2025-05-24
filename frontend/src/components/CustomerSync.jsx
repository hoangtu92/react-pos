import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import Button from "react-bootstrap/Button";
import {countCustomers, updateSyncCustomer} from "../features/customer/customerSlice";
import {Form, OverlayTrigger, ProgressBar, Tooltip} from "react-bootstrap";
import trans from "../utils/translate";
import {FaQuestionCircle} from "react-icons/fa";

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
                <h3 className={"border-bottom border-dark-subtle mb-4 pb-4"}>{trans("customer")}</h3>
                <div className={"d-flex pt-3 pb-3  flex-row align-items-center"}>
                    <Form.Group className={"w_50 d-flex flex-row mb-3 align-items-center"}>
                        <Form.Label className={"mb-0 w-100"}>{trans("max_day")}:</Form.Label>
                        <Form.Control min={0} type={"number"} placeholder={syncObj.look_back}
                                      disabled={syncObj.playing}
                                      onChange={e => dispatch(updateSyncCustomer({
                                          name: "look_back",
                                          value: e.target.value
                                      }))}/>

                        <OverlayTrigger
                            placement="right"
                            delay={{ show: 250, hide: 400 }}
                            overlay={<Tooltip id="button-tooltip">
                                {trans("product_sync_tips")}
                            </Tooltip>}
                        ><Button variant="dark"><FaQuestionCircle/></Button></OverlayTrigger>

                    </Form.Group>

                    <div className={"mb-3 ms-2"}>
                        {syncObj.playing ?
                            <Button variant={"warning"} onClick={pauseSyncCustomer}>{trans("pause")}</Button> :
                            syncObj.page > 1 ?
                                <Button variant={"success"} onClick={resumeSyncCustomer}>{trans("resume")}</Button>
                                :
                                <Button variant={"primary"} onClick={startSyncCustomer}>{trans("start")}</Button>
                        }
                        <Button className={"ms-2"} onClick={resetSyncCustomer} variant={"danger"}>{trans("reset")}</Button>
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
