import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Spinner from "react-bootstrap/Spinner";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import axios from "axios";
import { baseURL } from "../../Utils/baseURL";

const EditModal = ({ isOpen, onClose, uid }) => {

    const [contact, setContact] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!uid) return;

        setLoading(true);

        axios({
            url: `${baseURL}/api/v1/contact/getContactWithID`,
            method: "GET",
            params: { uid },
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${localStorage.getItem("user")}`,
            },
        })
            .then((res) => {
                if (res.status === 200) {
                    setContact(res.data.data.contacts);
                }
            })
            .catch(() => {
                setContact(null);
            })
            .finally(() => setLoading(false));

    }, [uid]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setContact((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Format Date -> DD/MM/YYYY HH:MM
    const formatDate = (date) => {

        const d = new Date(date);

        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();

        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    // Function called when update button is clicked
    const updateContact = () => {
        setLoading(true);
        const data = {
            uid: contact.uid,
            name: contact.name,
            phone: contact.phone,
            email: contact.email,
            company: contact.company,
            profileURL: contact.profileURL,
            source: contact.source,
            status: contact.status,
            message: message
        };

        axios({
            url: `${baseURL}/api/v1/contact/updateContactWithID`,
            method: "PUT",
            data: data,
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${localStorage.getItem("user")}`,
            },
        })
            .then((res) => {
                if (res.status === 200) {
                    alert("Contact updated successfully!");
                    setLoading(false);
                    onClose();
                }
            })
            .catch((err) => {
                const message = err.response?.data?.message;
                const code = err?.response?.status;
                setLoading(false);
                alert(`${message}:${code}`);
            });
    };

    if (loading || !contact) {
        return (
            <Modal show={isOpen} onHide={onClose} centered>
                <Modal.Body className="text-center">
                    <Spinner animation="border" />
                </Modal.Body>
            </Modal>
        );
    }

    return (
        <Modal show={isOpen} onHide={onClose} centered size="lg">

            <Modal.Header closeButton>
                <Modal.Title>Edit Contact</Modal.Title>
            </Modal.Header>

            <Modal.Body>

                <Form>

                    <Row className="mb-3">

                        <Col>
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                name="name"
                                value={contact.name || ""}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col>
                            <Form.Label>Phone</Form.Label>
                            <Form.Control
                                name="phone"
                                value={contact.phone || ""}
                                onChange={handleChange}
                            />
                        </Col>

                    </Row>

                    <Row className="mb-3">

                        <Col>
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                name="email"
                                value={contact.email || ""}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col>
                            <Form.Label>Company</Form.Label>
                            <Form.Control
                                name="company"
                                value={contact.company || ""}
                                onChange={handleChange}
                            />
                        </Col>

                    </Row>

                    <Row className="mb-3">

                        <Col>
                            <Form.Label>Profile URL</Form.Label>
                            <Form.Control
                                name="profileURL"
                                value={contact.profileURL || ""}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col>
                            <Form.Label>Source</Form.Label>
                            <Form.Control
                                name="source"
                                value={contact.source || ""}
                                onChange={handleChange}
                            />
                        </Col>

                    </Row>

                    <Row className="mb-3">

                        <Col>
                            <Form.Label>Message</Form.Label>
                            <Form.Control
                                placeholder="Message For Changing the Status"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </Col>

                        <Col>

                            <Form.Label>Status</Form.Label>

                            <Form.Select
                                name="status"
                                value={contact.status || ""}
                                onChange={handleChange}
                            >

                                <option value="New">New</option>
                                <option value="Connected">Connected</option>
                                <option value="Pending">Pending</option>
                                <option value="In progress">In progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Archived">Archived</option>

                            </Form.Select>

                        </Col>

                    </Row>

                </Form>

                <hr />

                <h5>Activities</h5>

                {contact.activities ? (

                    <Table bordered hover>

                        <thead>
                            <tr>
                                <th>S.No.</th>
                                <th>Activity</th>
                                <th>Message</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>

                        <tbody>

                            {contact.activities.activity?.map((act, index) => (

                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{act}</td>
                                    <td>{contact.activities.message?.[index]}</td>
                                    <td>{contact.activities.status?.[index]}</td>
                                    <td>
                                        {formatDate(contact.activities.dates?.[index])}
                                    </td>
                                </tr>

                            ))}

                        </tbody>

                    </Table>

                ) : (

                    <p>No activities found</p>

                )}

            </Modal.Body>

            <Modal.Footer>

                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>

                <Button variant="primary" onClick={updateContact}>
                    Update Contact
                </Button>

            </Modal.Footer>

        </Modal>
    );
};

export default EditModal;