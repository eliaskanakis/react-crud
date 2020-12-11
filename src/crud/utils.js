import fetch from 'isomorphic-fetch';
import Alert from 'react-bootstrap/Alert';

export async function callApi(method, url, body) {

    let headers = { "Content-Type": "application/json" };
    let options = {
        method: method,
        headers: headers,
        body: JSON.stringify(body)
    };
    try {
        let response = await fetch(url, options);
        if (!response.ok) {
            let body=await response.text();
            throw new Error(`Server returned status:${response.status} ${response.statusText}, Details:${body}, Type: ${response.type}.`);
        }
        response = await response.json();
        if (response && response.errors && response.errors.length) {
            throw new Error(`Error: ${response.errors[0].message}`);
        }
        return response;
    } catch (err) {
        throw new Error(err.message);
    }
}

export function createGql(queryObject,columns,additionalColumns,prms,prmValues){
    let prmStr = "";
    let gqlVars = {};
    if (prms) {
        prmStr = prms.map((prm) => {
            return prm.parameterName + ":$" + prm.parameterName;
        }).join(',');
        prmStr = `(${prmStr})`;
        prms.forEach((prm) => {
            if (prmValues[prm.parameterName]) gqlVars[prm.parameterName] = prmValues[prm.parameterName];
        });

    }
    let gqlStr = `{${queryObject}${prmStr}{`;

    let colsByObj = {};
    columns.forEach((col, i) => {
        let columnName = col.columnName;
        let objectName = "";
        let idxOfPoint = columnName.indexOf('.');
        if (idxOfPoint > 0 && idxOfPoint < columnName.length) {
            objectName = columnName.substring(0, idxOfPoint);
            columnName = columnName.substring(idxOfPoint + 1);
        }
        if (!colsByObj[objectName]) colsByObj[objectName] = [];
        colsByObj[objectName].push({objectName:objectName, columnName:columnName});
    });

    if (additionalColumns){
        additionalColumns.forEach((colName, i) => {
            if (!colsByObj[""]) {
                colsByObj[""] = [{ columnName: colName }];
            } else {
                if (!colsByObj[""].find(c => c.columnName === colName)) {
                    colsByObj[""].push({ columnName: colName });
                }
            }
        });
    }

    gqlStr += Object.keys(colsByObj).map((objectName, i) => {
        return ((objectName) ? objectName + "{" : "") +
            colsByObj[objectName].map((col) => {
                return col.columnName
            }).join(' ') +
            ((objectName) ? "}" : "");
    }).join(' ');

    gqlStr += "}}";

    return {
        query: gqlStr,
        variables: gqlVars
    };
}

export function createPkPrms(layout){
    if (!layout || !layout.primaryKey) return null;
    return layout.primaryKey.map(pkCol=>({parameterName:pkCol}));
}

export function createPkVals(layout,data,editRowIndex){
    if (!layout || !layout.primaryKey || !data || editRowIndex<0) return null;
    let pkVals={};
    layout.primaryKey.forEach(pkCol=>{
        pkVals[pkCol]=getPropValue(data[editRowIndex],pkCol)
    });
    return pkVals;
}

export function getPropValue (obj, propPath) {
    let pathArray = propPath.split('.');

    return pathArray.reduce((o, key) => {
        return (o && o[key] !== 'undefined') ? o[key] : null
    },obj);
}

export function setPropValue (obj, propPath,value) {
    if (!obj) return;
    let pathArray = propPath.split('.');
    let o=obj;
    pathArray.forEach((propertyName,i)=>{
        if (!o) return;
        if (i===pathArray.length-1) o[propertyName]=value;
        else o=o[propertyName];
    });
}


export function capitalize(s) {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

export function ErrorAlert(props) {
    if (!props || !props.message) return null;
    return (
        <Alert variant="danger">
            <p className="mb-0">
                {props.message}
            </p>
        </Alert>
    );
}