import React, {useState} from "react";
import Products from "./Products";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import {useDispatch, useSelector} from "react-redux";
import {getCustomers, guestCheckout, memberCheckout} from "../features/customer/customerSlice";
import ShoppingCart from "./ShoppingCart";
import CustomerItem from "../components/CustomerItem";

const Pos = () => {
  const {customers, selectedCustomer} = useSelector((state) => state.customer);
  const [showCustomerModal, setShowCustomerModal] = useState(true);

  const dispatch = useDispatch();

  const handleCloseCustomer = () => setShowCustomerModal(false);

  const applyCustomer = () => {
    dispatch(memberCheckout())
    handleCloseCustomer();
  }
  const applyGuest = () => {
    dispatch(guestCheckout());
    handleCloseCustomer();
  }

  const onChange = (e) => {
    dispatch(getCustomers(e.target.value));
  }

  return (
      <>
        <div className={"d-flex "}>

          <Products />

          <div className="sidebarRight">
            <ShoppingCart customer={selectedCustomer} />
          </div>

          <Modal show={showCustomerModal} backdrop={"static"} keyboard={false} onHide={handleCloseCustomer}>
            <Modal.Header closeButton>
              <Modal.Title>Select Customer</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <Form>
                <Form.Group className="mb-3" controlId="searchCustomer.ControlInput1">
                  <Form.Control
                      type="phone"
                      size={"lg"}
                      onChange={onChange}
                      placeholder="Customer phone number"
                      autoFocus
                  />
                </Form.Group>

                {customers.length > 0 ? <CustomerItem customer={customers[0]} />
                  : null}

              </Form>
            </Modal.Body>

            <Modal.Footer>
              {customers.length > 0 ?
              <Button variant="primary" onClick={applyCustomer}>
                Apply
              </Button> : null}

              <Button variant="secondary" onClick={applyGuest}>
                Guest Checkout
              </Button>
            </Modal.Footer>
          </Modal>

        </div>

      </>
  );
};

export default Pos;
