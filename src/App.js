import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

import Home from './Home';
import logo from 'bootstrap-icons/icons/view-list.svg'; 
import './App.css';
import GraphiQLWrapper from './GraphiQLWrapper';
import CrudList from './crud/CrudList'

function App() {
  return (
    <Container fluid="md">
      <Router>
        <Navbar bg="dark" variant="dark" expand="sm" className="mb-2">
          <Navbar.Brand as={Link} to="/">
            <img
              src={logo}
              width="30"
              height="30"
              className="d-inline-block align-top"
              alt="crud"
            />{' '}CRUD Demo
            </Navbar.Brand>
        </Navbar>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/categories">
            <CrudList layoutUrl="api/layouts/category-list" />
          </Route>
          <Route path="/items">
            <CrudList layoutUrl="api/layouts/guitar-list" />
          </Route>
          <Route path="/layouts">
            <CrudList layoutUrl="api/layouts/layout-list" />
          </Route>          
          <Route path="/graph-iql">
            <GraphiQLWrapper />
          </Route>
        </Switch>
      </Router>
    </Container>
  );
}

export default App;
