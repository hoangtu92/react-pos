import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import Button from "react-bootstrap/Button";
import {countProducts, truncateProduct, updateSyncProduct} from "../features/product/productSlice";
import {Form, OverlayTrigger, ProgressBar, Tooltip} from "react-bootstrap";
import {FaQuestionCircle} from "react-icons/fa";
import trans from "../utils/translate";

const ProductSync = () => {
    const {syncObj} = useSelector((state) => state.product);
    const dispatch = useDispatch();

    useEffect(() => {
        if (syncObj.playing) dispatch(countProducts());
    }, [dispatch, syncObj.playing])


    const resetSyncProduct = () => {
        dispatch(updateSyncProduct({name: "page", value: 1}))
        dispatch(updateSyncProduct({name: "total_products", value: 0}))
        dispatch(updateSyncProduct({name: "synced_products", value: 0}))
        dispatch(updateSyncProduct({name: "synced_percent", value: 0}))
        dispatch(updateSyncProduct({name: "playing", value: false}));

    }

    const startSyncProduct = () => {
        resetSyncProduct()
        dispatch(updateSyncProduct({name: "playing", value: true}));
    }

    const resumeSyncProduct = () => {
        dispatch(updateSyncProduct({name: "page", value: syncObj.page + 1}))
        dispatch(updateSyncProduct({name: "playing", value: true}));
    }

    const pauseSyncProduct = () => {
        dispatch(updateSyncProduct({name: "playing", value: false}));
    }

    return (
        <>
            <div className={"border-opacity-25 p-4 border-dark border"}>
                <h3 className={"border-bottom border-dark-subtle mb-4 pb-4"}>{trans("product")}</h3>
                <div className={"d-flex pt-3 pb-3 flex-row align-items-center"}>
                    <Form.Group className={"w_50 d-flex flex-row mb-3 align-items-center"}>
                        <Form.Label className={"mb-0 w-100"}>{trans("max_day")}:</Form.Label>
                        <Form.Control min={0} type={"number"} placeholder={syncObj.look_back}
                                      disabled={syncObj.playing}
                                      onChange={e => dispatch(updateSyncProduct({
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
                            <Button variant={"warning"} onClick={pauseSyncProduct}>{trans("pause")}</Button> :
                            syncObj.page > 1 ?
                                <Button variant={"success"} onClick={resumeSyncProduct}>{trans("resume")}</Button>
                                :
                                <Button variant={"primary"} onClick={startSyncProduct}>{trans("start")}</Button>
                        }
                        <Button className={"ms-2"} onClick={resetSyncProduct} variant={"danger"}>{trans("reset")}</Button>
                        <OverlayTrigger
                            placement="right"
                            delay={{ show: 250, hide: 400 }}
                            overlay={<Tooltip id="button-tooltip">
                                {trans("product_sync_wipe_tips")}
                            </Tooltip>}
                        ><Button className={"ms-2"} onClick={e => dispatch(truncateProduct())} variant={"dark"}>{trans("wipe")}</Button></OverlayTrigger>


                    </div>
                </div>
                <div className={"mb-2"}>
                    <span>Synced {syncObj.synced_products} of total {syncObj.total_products} products</span>
                </div>
                <ProgressBar striped variant="success" now={syncObj.synced_percent}
                             label={`${Math.round(syncObj.synced_percent)}%`}/>
            </div>
        </>
    );
};

export default ProductSync;
