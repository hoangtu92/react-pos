import React from "react";
import { useState } from "react";
import { FaPlusCircle, FaMinus } from "react-icons/fa";

const Modal = () => {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <button
        onClick={() => {
          setOpenModal(true);
        }}
      >
        {!openModal ? (
          <FaPlusCircle className="modal-icon" />
        ) : (
          <FaMinus className="modal-icon" />
        )}
      </button>

    </>
  );
};

export default Modal;
