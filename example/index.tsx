import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Table from "../src";
import {ColumnDefinition} from "../src/table/Table";
import {useEffect, useState} from "react";

type ExampleObj = {
  id: number | string;
  name: string;
  param: string;
  age: number;
  firstName: string;
  lastName: string;
  group: string;
  children?: Array<ExampleObj>;
};

let mockData: Array<ExampleObj> = [];

const getSimpleData = (count: number = 10000) => {
  for (let i = 0; i < count; i++) {
    mockData.push({
      id: i,
      name: `Value ${i}`,
      param: `Param ${i}`,
      age: i,
      firstName: `FirstName ${i}`,
      lastName: `LastName ${i}`,
      group: `Group ${Math.random().toFixed(1)}`
    });
  }
};

getSimpleData(10000);

// const getTreeData = (arr: Array<ExampleObj>, nesting: number = 1): Array<ExampleObj> => {
//   arr.forEach((value) => {
//     if (nesting < 3) {
//       value.children = getTreeData([...arr].map((child, index) => ({...child, name: `${value.name}__${index}`, id: `${value.id}_${index}`, children: undefined})), nesting + 1);
//     }
//   });
//
//   return arr;
// }
//
// mockData = getTreeData(mockData);

const colDefs: Array<ColumnDefinition> = [
  {name: "id", key: "id"},
  {
    name: "name",
    key: "name",
    width: 100,
    renderer: (value) => <div style={{color: "red"}}>{value.name as string}</div>
  },
  {name: "param", key: "param"},
  {name: "age", key: "age"},
  {name: "firstName", key: "firstName"},
  {name: "lastName", key: "lastName"},
]

const App = () => {
  const [rows, setRows] = useState(mockData);

  useEffect(() => {
    // setInterval(() => setRows(rows => [...rows]), 1000);
  }, []);

  return (
    <div>
      <div style={{height: "400px", position: "relative", boxSizing: "border-box", overflowX: "hidden"}}>
        <Table data={rows} colDefs={colDefs} treeBy={"children"} />
      </div>
    </div>
  );
};

ReactDOM.render(<App/>, document.getElementById('root'));
