import React from "react";
import Form from 'react-bootstrap/Form';

const ProductSearch = (props) => {

    return (
        <>
            <Form className={"pr-5"}>
                <Form.Group className="mb-3" controlId="form.search">
                    <Form.Control onChange={props.onChange} type="search" size={"lg"} placeholder="SKU, Title..." />
                </Form.Group>
            </Form>
        </>
    );
};

export default ProductSearch;
