import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import "../dist/rs-table.cjs.development.css";
import { ColumnDefinition, Table } from "../dist";
import { defaultCheckboxColDef } from "../src/components/table/Renderers";

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

const getSimpleData = (count: number = 10000) => {
  const tmp: Array<ExampleObj> = [];
  for (let i = 0; i < count; i++) {
    tmp.push({
      id: i,
      name: `Value ${i}`,
      param: `Param ${i}`,
      age: i,
      firstName: `FirstName ${i}`,
      lastName: `LastName ${i}`,
      group: `Group ${Math.random().toFixed(1)}`
    });
  }

  return tmp;
};

const getTreeData = (arr: Array<ExampleObj>, nesting: number = 1): Array<ExampleObj> => {
  arr.forEach((value) => {
    if (nesting < 3) {
      value.children = getTreeData([...arr].map((child, index) => ({
        ...child,
        name: `${value.name}__${index}`,
        id: `${value.id}_${index}`,
        children: undefined
      })), nesting + 1);
    }
  });

  return arr;
};

// const data: Array<ExampleObj> = getSimpleData(10000);
const treeData: Array<ExampleObj> = getTreeData(getSimpleData(15));

const colDefs: Array<ColumnDefinition<ExampleObj>> = [
  defaultCheckboxColDef,
  {
    tree: true,
    name: "Name",
    key: "name",
    width: 100
  },
  { name: "Param", key: "param", renderer: (value) => <div style={{ color: "red" }}>{value.name as string}</div> },
  { name: "Age", key: "age" },
  { name: "FirstName", key: "firstName" },
  { name: "LastName", key: "lastName" }
];

const App = () => {
  return (
    <div style={{display: "flex"}}>
      <div style={{ height: "500px", width: "50%" }}><Table data={treeData} colDefs={colDefs} treeBy={"children"}/></div>
      <div style={{ height: "500px", width: "50%" }}><Table data={treeData} colDefs={colDefs} treeBy={"children"}/></div>
    </div>
  );
};

ReactDOM.render(<App/>, document.getElementById('root'));
