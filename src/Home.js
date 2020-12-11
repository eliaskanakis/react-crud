import React from 'react';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import { Link } from "react-router-dom";

function Home(props) {
    return (
        <Card>
            <Card.Header>Featured</Card.Header>
            <Card.Body>
                <ListGroup variant="flush">
                    <ListGroup.Item action as={Link} to="/categories">
                        Categories
                    </ListGroup.Item>
                    <ListGroup.Item action as={Link} to="/items">
                        Items
                    </ListGroup.Item>
                    <ListGroup.Item action as={Link} to="/graph-iql">
                        GraphiQL
                    </ListGroup.Item>                    
                </ListGroup>
            </Card.Body>
        </Card>
    );
}

export default Home;