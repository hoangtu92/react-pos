import React from "react";
import Form from 'react-bootstrap/Form';

import {updateSettings} from "../features/cart/cartSlice";


const ProductSearch = ({settings, onChange, onSubmit, dispatch}) => {

    return (
        <>
            <Form className={"d-flex flex-column align-items-start"} onSubmit={onSubmit}>
                <Form.Group>
                    <div className={"mb-2"}>
                        <Form.Check // prettier-ignore
                            type="switch"
                            id="autoCart"
                            checked={settings.scanMode}
                            onChange={e => {
                                dispatch(updateSettings({name: "scanMode", value: e.target.checked}))
                            }}
                            label={"Scan Mode"}
                        />
                    </div>
                </Form.Group>
                <Form.Group className="mb-3 flex-grow-1 w-100" controlId="form.search">
                    <Form.Control name={"search"} autoFocus={true} onFocus={e => e.target.select()} onChange={onChange} type="search" size={"lg"} placeholder={settings.scanMode ? "SKU..." : "SKU, Title..."} />
                </Form.Group>
            </Form>
        </>
    );
};

export default ProductSearch;
