import React from "react";
import {Badge, ListGroup} from "react-bootstrap";

const CustomerItem = ({ customer }) => {
    return (
        <div className="customer-details d-grid w-100 mb-2" key={customer._id}>

            <ListGroup as="ol" numbered>
                <ListGroup.Item variant="success" as="li" className="d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto d-flex flex-column">
                        <h5 className="fw-bold">{customer.name}</h5>
                        <small>{customer.phone}</small>
                        <small>{customer.email}</small>
                    </div>

                    <Badge bg="warning" color={"white"} pill>{customer.points} points</Badge>
                </ListGroup.Item>
            </ListGroup>
        </div>
    );
};

export default CustomerItem;
