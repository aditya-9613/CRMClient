import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import axios from "axios";
import { baseURL } from "../../Utils/baseURL";

const ContactModal = ({ show, onClose, onSave }) => {

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        profileURL: "",
        company: "",
        source: ""
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        if (onSave) {
            onSave(formData);
        }

        axios({
            url: `${baseURL}/api/v1/contact/addContact`,
            method: "POST",
            data: formData,
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("user")}`
            }
        }).then((res) => {
            if (res.status === 200) {
                alert("Contact added successfully!");
                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    profileURL: "",
                    company: "",
                    source: ""
                });
                setLoading(false);
                onClose();
            }
        }).catch((err) => {
            const message = err.response?.data?.message;
            const code = err?.response?.status;
            setLoading(false);
            alert(`${message}:${code}`);
        });
    };

    return (
        <Modal
            show={show}
            onHide={onClose}
            centered
            size="lg"
        >
            <Modal.Header closeButton>
                <Modal.Title>Add New Contact</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form onSubmit={handleSubmit}>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Phone</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="phone"
                                    placeholder="+91 9876543210"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    placeholder="john@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Company</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="company"
                                    placeholder="Company Name"
                                    value={formData.company}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Profile URL</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="profileURL"
                                    placeholder="LinkedIn / Website"
                                    value={formData.profileURL}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Source</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="source"
                                    placeholder="LinkedIn / Website / Referral"
                                    value={formData.source}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end mt-4">
                        <Button
                            variant="secondary"
                            className="me-2"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>

                        <Button variant="primary" type="submit" disabled={loading}>
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
                                    Saving...
                                </>
                            ) : (
                                "Save Contact"
                            )}
                        </Button>
                    </div>

                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ContactModal;