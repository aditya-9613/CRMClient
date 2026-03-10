import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import axios from "axios";
import { baseURL } from "../../Utils/baseURL";

const DeleteModal = ({ isOpen, onClose, uid, name }) => {

    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")

    const deleteContact = async () => {
        setLoading(true)
        axios({
            url: `${baseURL}/api/v1/contact/deleteContact`,
            method: 'PUT',
            withCredentials: true,
            data: ({ uid, message }),
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('user')}`
            }
        }).then((res) => {
            setLoading(false)
            if (res.status === 200) {
                alert(res.data.message)
                onClose();
            }
        }).catch((err) => {
            const message = err.response?.data?.message;
            const code = err?.response?.status;
            setLoading(false);
            alert(`${message}:${code}`);
        })
    }
    return (
        <Modal
            show={isOpen}
            onHide={onClose}
            centered
            size="lg"
        >
            <Modal.Header closeButton>
                <Modal.Title>Delete Contact</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <h4>Remember to confirm the deletion of this contact {name}.</h4>
                <p style={{ color: "#475569" }}>This action cannot be undone.</p>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Message for Deletion</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Message"
                            onChange={((e) => setMessage(e.target.value))}
                        />
                    </Form.Group>
                </Form>
                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={deleteContact}>
                        {loading ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                Deleting...
                            </>
                        ) : (
                            "Delete Contact"
                        )}
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    )
}

export default DeleteModal