import { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Image from 'react-bootstrap/Image';

import { callApi, createGql, getPropValue, setPropValue, capitalize, ErrorAlert } from './utils'

function CrudForm(props) {
    const [error, setError] = useState(null);
    const [serverUrl] = useState(process.env.REACT_APP_SERVER_URL);
    const [layout, setLayout] = useState(null);
    const [allCols, setAllCols] = useState(null);
    const [lookUpInfo, setLookUpInfo] = useState(null);
    const [foreignKeyFields, setForeignKeyFields] = useState([]);
    const [obj, setObj] = useState({});

    useEffect(() => {
        async function getLayout() {
            try {
                setError(null);
                if (layout || !props.layoutUrl || !props.active) return;
                const l=await callApi('GET', `${serverUrl}/${props.layoutUrl}`);
                setAllCols(l.tabs.map(tab => tab.columns).reduce((prev, current) => prev.concat(current)));
                setLayout(l);
            } catch (err) {
                setError(err.message);
            }
        };
        getLayout();
    }, [layout, props.active, props.layoutUrl, serverUrl]);

    useEffect(() => {
        async function getLookUpInfo() {
            if (!allCols || lookUpInfo) return;
            let foreignCols =allCols.filter(col => col.controlType === "DropDownLookUpList");
            let tmpLookUpInfo = {}, tmpForeignKeyFields = [];
            try {
                for (let i = 0; i < foreignCols.length; i++) {
                    const gqlResult = await callApi('POST', `${serverUrl}/api/query`, 
                        { query: foreignCols[i].lookUpQuery, vars: {} });
                    tmpLookUpInfo[foreignCols[i].columnName] = {
                        "values": gqlResult.data[Object.keys(gqlResult.data)[0]],
                        "keyFields": foreignCols[i].keyFields
                    };
                    tmpForeignKeyFields = tmpForeignKeyFields.concat(foreignCols[i].keyFields.map(k => k.foreignField));
                }
            } catch (err) {
                setError(err.message);
            }
            setLookUpInfo(tmpLookUpInfo);
            setForeignKeyFields(tmpForeignKeyFields);
        }
        getLookUpInfo();
    }, [allCols, lookUpInfo, serverUrl]);

    useEffect(() => {
        async function getData() {
            setObj({});
            if (!layout || !props.pkValues || !props.active) return;
            if (!foreignKeyFields) return;
            const requestBody = createGql(layout.queryObject, allCols, 
                Object.keys(props.pkValues).concat(foreignKeyFields), props.queryParameters, props.pkValues);
            const queryObject = layout.queryObject;
            const gqlResult = await callApi('POST', `${serverUrl}/api/query`, requestBody);
            if (gqlResult.data[queryObject]) setObj(gqlResult.data[queryObject]);
        };
        getData();
    }, [allCols, foreignKeyFields, layout, props.active, props.pkValues, props.queryParameters, serverUrl]);

    async function mutate(action) {
        try {
            let queryObject=capitalize(layout.queryObject);
            let oprName=`${action}${queryObject}`;
            const requestBody = {
                query: `mutation ${oprName}($obj: ${queryObject}!){` +
                    `${oprName}(${layout.queryObject}: $obj)}`,
                variables: { "obj": obj }
            };
            const gqlResult = await callApi('POST', 
                `${serverUrl}/api/query`, requestBody);
            if (props.onSave) 
                props.onSave(gqlResult.data[oprName], action === "delete");
        } catch (err) {
            setError(err.message);
        }
    }

    async function saveClicked() {
        let action = "update";
        if (!props.pkValues) action = "add";
        mutate(action);
    }

    async function deleteClicked() {
        mutate("delete");
    }

    function setObjectValue(propertyName, value, selectedIndex) {
        let tmpObj = { ...obj };
        setPropValue(tmpObj, propertyName, value);
        if (selectedIndex >= 0 && lookUpInfo[propertyName] && lookUpInfo[propertyName].keyFields) {
            lookUpInfo[propertyName].keyFields.forEach(kf => {
                if (selectedIndex === 0) tmpObj[kf.foreignField] = null;
                else tmpObj[kf.foreignField] = lookUpInfo[propertyName].values[selectedIndex - 1][kf.primaryField];
            });
        }
        setObj(tmpObj);
    }

    function createTextBox(column) {
        return <Form.Control
            placeholder={column.caption}
            value={getPropValue(obj, column.columnName)}
            onChange={e => setObjectValue(column.columnName, e.target.value)}
        />;
    }

    function createCheckBox(column) {
        return <Form.Check
            type="checkbox"
            checked={getPropValue(obj, column.columnName)}
            id={column.fieldName}
            onChange={e => setObjectValue(column.columnName, e.target.checked)}
        />;
    }

    function createDropDownValueList(column) {
        return (
            <Form.Control
                as="select"
                value={getPropValue(obj, column.columnName)}
                onChange={e => setObjectValue(column.columnName, e.target.value)}
            >
                {column.values.map((val, i) =>
                    <option value={val}>{val}</option>
                )}
            </Form.Control>
        );
    }

    function createDropDownLookUpList(column) {
        if (!lookUpInfo || !lookUpInfo[column.columnName]) return null;
        return (
            <Form.Control
                as="select"
                value={getPropValue(obj, column.columnName)}
                onChange={e => setObjectValue(column.columnName, e.target.value, e.target.selectedIndex)}
            >
                <option value={null}></option>
                {lookUpInfo[column.columnName].values.map((lkpObj, i) =>
                    <option value={lkpObj[column.dropDownDisplay]}>{lkpObj[column.dropDownDisplay]}</option>
                )}
            </Form.Control>
        );
    }

    function createImageUrlControl(column) {
        let imageUrlTextBox = createTextBox(column);
        return (
            <>
                {imageUrlTextBox}
                <Col xs={6}>
                    <Image src={getPropValue(obj, column.columnName)} rounded fluid />
                </Col>
            </>
        );
    }

    function createTextArea(column) {
        return <Form.Control
            as="textarea"
            style={{ height: "50vh" }}
            placeholder={column.caption}
            value={getPropValue(obj, column.columnName)}
            onChange={e => setObjectValue(column.columnName, e.target.value)}
        />;
    }

    function createControl(column) {
        if (column.controlType === "CheckBox") {
            return createCheckBox(column);
        } else if (column.controlType === "DropDownValueList") {
            return createDropDownValueList(column);
        } else if (column.controlType === "DropDownLookUpList") {
            return createDropDownLookUpList(column);
        } else if (column.controlType === "ImageUrl") {
            return createImageUrlControl(column);
        }
        else if (column.controlType === "TextArea") {
            return createTextArea(column);
        }
        else {
            return createTextBox(column);
        }
    }

    function createTabs(obj) {
        if (!layout || !layout.tabs) return null;
        let tabElements = layout.tabs.map((tab, i) => {
            let fieldElements = tab.columns.map((column, j) =>
                <Form.Group key={i + "." + j} as={Row}>
                    <Form.Label column sm={3}>{column.caption}</Form.Label>
                    <Col sm={9}>{createControl(column)}</Col>
                </Form.Group>
            );
            return (
                <Tab className="pt-2" key={i} eventKey={"tab" + i} title={tab.caption}>
                    {fieldElements}
                </Tab>
            );
        });
        return <Tabs defaultActiveKey="tab0">{tabElements}</Tabs>
    }

    return (
        <Modal show={props.active} onHide={props.onHide} backdrop="static" size={(layout && layout.size) ? layout.size : "md"}>
            <Modal.Header closeButton>
                <Modal.Title>{props.caption}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ErrorAlert message={error} />
                {createTabs(obj)}
            </Modal.Body>
            <Modal.Footer className="justify-content-between">
                {props.allowDelete ?
                    <Button className="mr-auto" variant="secondary" onClick={deleteClicked}>
                        Delete
                    </Button>
                    : null}
                <Button variant="secondary" onClick={props.onHide}>
                    Close
                </Button>
                <Button variant="primary" onClick={saveClicked}>
                    Save
                </Button>
            </Modal.Footer >
        </Modal >
    );
}

export default CrudForm;