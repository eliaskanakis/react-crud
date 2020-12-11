import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Navbar from 'react-bootstrap/Navbar'

import { ReactComponent as InsertIcon } from 'bootstrap-icons/icons/plus-square.svg';
import { ReactComponent as RefreshIcon } from 'bootstrap-icons/icons/arrow-clockwise.svg';
import { ReactComponent as EditIcon } from 'bootstrap-icons/icons/pencil-square.svg';

import {
    callApi, createGql, getPropValue, createPkPrms,
    createPkVals, ErrorAlert
} from './utils';
import CrudForm from './CrudForm';

import './CrudList.css'

function CrudList(props) {
    const [layout, setLayout] = useState(null);
    const [error, setError] = useState(null);
    const [serverUrl] = useState(process.env.REACT_APP_SERVER_URL);
    const [data, setData] = useState(null);
    const [prmValues, setPrmValues] = useState({});
    const [prmControlValues, setPrmControlValues] = useState({});
    const [editModeActive, setEditModeActive] = useState(false);
    const [editRowIndex, setEditRowIndex] = useState(-1);

    useEffect(() => {
        async function getLayout() {
            try {
                if (layout || !props.layoutUrl || !serverUrl) return;
                setLayout(await callApi('GET', `${serverUrl}/${props.layoutUrl}`));
            } catch (err) {
                setError(err.message);
            }
        };
        getLayout();
    }, [layout, props.layoutUrl, serverUrl]);

    useEffect(()=>{
        async function getData() {
            try {
                if (!layout) return;
                const requestBody = createGql(layout.queryObject, layout.columns, layout.primaryKey, layout.queryParameters, prmValues);
                const queryObject = layout.queryObject;
                const gqlResult = await callApi('POST', `${serverUrl}/api/query`, requestBody);
                setData(gqlResult.data[queryObject]);
            } catch (err) {
                setError(err.message);
            }            
        }
        getData();
    },[layout, prmValues, serverUrl]);    

    function prmValueChanged(e, prm) {
        setPrmControlValues(prev=>({...prev, [prm.parameterName] : e.target.value} ));
    }

    async function refreshClicked() {
        setPrmValues({...prmControlValues});
    }

    function beginEdit(i) {
        setEditRowIndex(i);
        setEditModeActive(true);
    }

    function onSave(obj, deleted) {
        if (editRowIndex < 0) data.push(obj);
        else if (!deleted) data[editRowIndex] = obj;
        else data.splice(editRowIndex, 1);
        setEditModeActive(false);
    }

    function createPrmControls() {
        if (!layout || !layout.queryParameters) return null;
        return layout.queryParameters.map((prm, i) => {
            let placeHolder = prm.caption;
            return (<>
                <Form.Label key={`lbl${i}`} size="sm" htmlFor={`prm${i}`} srOnly>{placeHolder}</Form.Label>
                <Form.Control
                    size="sm" className="mb-0 mr-sm-2" key={`ctl${i}`} id={`prm${i}`}
                    placeholder={placeHolder} value={prmControlValues[prm.parameterName]}
                    onChange={(e) => prmValueChanged(e, prm)}
                /></>);
        });
    }

    function createNavBar() {
        if (!layout) return;
        return (
            <Navbar bg="light" size="sm" className="justify-content-between bt-1 py-1">
                <Form inline>
                    <Navbar.Brand key="brand">{layout.caption}</Navbar.Brand>
                    {createPrmControls()}
                    <Button size="sm" key="refresh" variant="" onClick={refreshClicked}><RefreshIcon /></Button>
                    {(layout.allowNew) ? <Button key="insert" size="sm" variant="" onClick={() => beginEdit(-1)}><InsertIcon /></Button> : null}
                </Form>
            </Navbar>
        );
    }

    function createHeader() {
        if (!layout || !layout.columns) return;
        let headerCols = layout.columns.map((col, i) => {
            return (
                <th scope="col" key={i}>{col.caption}</th>
            );
        });
        if (layout.allowUpdate) {
            headerCols = <><th scope="col" key="rhhe" className="controlCol"></th>{headerCols}</>;
        }
        return headerCols;
    }

    function createCell(obj, col, rowIndex) {
        let colValue = getPropValue(obj, col.columnName);
        if (col.controlType === "CheckBox") {
            return (
                <td key={rowIndex}><input type="checkbox" className="checkbox" checked={colValue} readOnly /></td>
            );
        } else {
            return (
                <td key={rowIndex}>
                    {colValue}
                </td>
            );
        }
    }

    function createRows() {
        if (!layout || !data) return null;
        return data.map((obj, i) => {
            let rowCols = layout.columns.map((col, i) => {
                return createCell(obj, col, i)
            });
            let editButton = null;
            if (layout.allowUpdate || layout.allowDelete) {
                editButton = <td key="rhde">
                    <Button size="sm" variant="" onClick={() => beginEdit(i)}><EditIcon /></Button>
                </td>;
            }
            return (
                <tr key={i}>
                    {editButton}
                    {rowCols}
                </tr>
            );
        });
    }

    return (
        <>
            <CrudForm
                active={editModeActive}
                layoutUrl={layout ? layout.editFormUrl : null}
                onHide={() => setEditModeActive(false)}
                onSave={onSave}
                caption={layout ? layout.caption : null}
                queryParameters={createPkPrms(layout)}
                pkValues={createPkVals(layout, data, editRowIndex)}
                allowDelete={layout ? layout.allowDelete : null}
            />
            <ErrorAlert message={error} />
            {createNavBar()}
            <table className="table table-sm table-striped">
                <thead><tr>{createHeader()}</tr></thead>
                <tbody>{createRows()}</tbody>
            </table>
        </>
    );
}

export default CrudList;