import React from "react";
import Form from 'react-bootstrap/Form';

const ProductSearch = ({settings, onChange, onSubmit}) => {

    return (
        <>
            <Form className={"d-flex flex-column align-items-start"} onSubmit={onSubmit}>
                <Form.Group className="mb-3 flex-grow-1 w-100" controlId="form.search">
                    <Form.Control name={"search"} autoFocus={true} onFocus={e => e.target.select()} onChange={onChange} type="search" size={"lg"} placeholder={settings.scanMode ? "SKU..." : "SKU, Title..."} />
                </Form.Group>
            </Form>
        </>
    );
};

export default ProductSearch;
