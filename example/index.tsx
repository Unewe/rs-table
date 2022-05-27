import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Table from "../src";
import {ColumnDefinition} from "../src/table/Table";
import {useState} from "react";

const mockData: Array<{ id: number, name: string, param: string, age: number, firstName: string, lastName: string }> = [];

for (let i = 0; i < 10000; i++) {
  mockData.push({
    id: i,
    name: `Value ${i}`,
    param: `Param ${i}`,
    age: i,
    firstName: `FirstName ${i}`,
    lastName: `LastName ${i}`
  });
}

const colDefs: Array<ColumnDefinition> = [
  {name: "id", key: "id"},
  {name: "name", key: "name", width: 100, renderer: (value) => <div style={{color: "red"}}>{value.name as string}</div>},
  {name: "param", key: "param"},
  {name: "age", key: "age"},
  {name: "firstName", key: "firstName"},
  {name: "lastName", key: "lastName"},
]

const App = () => {
  const [rows] = useState(mockData);

  return (
    <div>
      <div style={{height: "400px", position: "relative"}}>
        <Table data={rows} colDefs={colDefs}/>
      </div>
    </div>
  );
};

ReactDOM.render(<App/>, document.getElementById('root'));
