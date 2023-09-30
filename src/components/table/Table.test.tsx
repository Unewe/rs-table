import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Table from "./Table";
import { ColumnDefinition } from "./Table.types";

const data: Array<Record<"id" | "name", string>> = [{ id: "1", name: "admin" }, { id: "2", name: "developer" }];
const colDefs: Array<ColumnDefinition<Record<"id" | "name", string>>> = [
  { name: "Id", key: "id" },
  { name: "Name", key: "name" },
];


describe("Table", () => {
  render(<Table data={data} colDefs={colDefs} treeBy={"name"}/>);
  it("Рендерится без ошибок", () => {
    waitFor(() => {
      expect(screen.getByText(/admin/i)).not.toBeUndefined();
      expect(screen.getByText(/developer/i)).not.toBeUndefined();
    });
  });
});