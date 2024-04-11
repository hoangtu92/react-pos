import React from "react";
import {Badge, ListGroup} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import {FaTrashAlt} from "react-icons/fa";

const CustomerItem = ({ customer, onClick, onClose }) => {
    return (
        <div className="customer-details d-grid w-100 mb-2" key={customer._id} onClick={onClick}>

            <ListGroup as="ol">
                <ListGroup.Item variant={customer.is_b2b ? "dark" : "primary"} as="li" className="d-flex justify-content-between align-items-center">
                    <div className="me-auto d-flex flex-column">
                        <span className="fw-bold">{customer.name}</span>
                        <small>{customer.phone}</small>
                        <small>{customer.email}</small>
                    </div>

                    <div className={"d-flex flex-1 flex-column align-items-center justify-content-between"}>
                        {onClose ? <Button size={"sm"} variant={"danger"} className={"mb-2"} onClick={onClose}><FaTrashAlt/></Button>: null}
                        <Badge bg="warning" className={"mb-2 text-dark"}>{customer.points} points</Badge>
                        <Badge bg="success" color={"white"}><small><strong>{customer.is_b2b ? "B2B" : "B2C"}: </strong>{customer.is_b2b ? customer.buyer_id : customer.carrier_id}</small></Badge>
                    </div>
                </ListGroup.Item>
            </ListGroup>
        </div>
    );
};

export default CustomerItem;
