import React, { useRef } from "react";
import { getClassName } from "../../utils";
import { FilterProps, Row, TechRow } from "../index";

const liClassName = getClassName("filter-row");

interface NumberFilterValue {
  from: string;
  to: string;
}

export const Filter = <T extends TechRow<Row>>({ apiRef, col }: FilterProps<T>): React.ReactElement => {
  const [stringFilterValue, setStringFilterValue] = React.useState(
    apiRef.current.filter?.key === col.key ? (apiRef.current.filter.value as string) : ""
  );
  const [numberFilterValue, setNumberFilterValue] = React.useState<NumberFilterValue>(
    apiRef.current.filter?.key === col.key ? (apiRef.current.filter.value as NumberFilterValue) : { from: "", to: "" }
  );
  const type = col.filterType;
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleStringFilterInput: React.ChangeEventHandler<HTMLInputElement> = event => {
    setStringFilterValue(event.target.value);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      if (event.target.value) {
        setFilter({
          key: col.key,
          value: event.target.value,
          predicate: (value: string) => value.toString().includes(event.target.value),
        });
      } else {
        setFilter(undefined);
      }
    }, 500);
  };

  const handleNumberFilterInput: React.ChangeEventHandler<HTMLInputElement> = event => {
    const key = event.target.name as keyof NumberFilterValue;
    const value = event.target.value;

    const filterValue: NumberFilterValue = { ...numberFilterValue, [key]: value };
    setNumberFilterValue(filterValue);

    const from = filterValue.from;
    const to = filterValue.to;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      if (from || to) {
        setFilter({
          key: col.key,
          value: filterValue,
          predicate: (value: number) => {
            if (from && to) {
              return value >= parseInt(from) && value <= parseInt(to);
            } else if (from) {
              return value >= parseInt(from);
            } else {
              return value <= parseInt(to);
            }
          },
        });
      } else {
        setFilter(undefined);
      }
    }, 500);
  };

  const { setSort, setFilter } = apiRef.current;
  return (
    <ul className={getClassName("filter-dialog")}>
      <li className={liClassName}>
        <button onClick={() => setSort({ key: col.key, direction: "asc" })} >
          Сортировка от А до Я / от A до Z
        </button>
      </li>
      <hr />
      <li className={liClassName}>
        <button onClick={() => setSort({ key: col.key, direction: "desc" })} >
          Сортировка от Я до А / от Z до A
        </button>
      </li>
      <hr />
      {type === "string" ? (
        <div className={getClassName("filter-input")}>
          <input
            onChange={handleStringFilterInput}
            value={stringFilterValue}
            style={{ width: "100%" }}
            placeholder={"Найти"}
          />
        </div>
      ) : null}
      <hr />
      {type === "number" ? (
        <div className={getClassName("filter-input")}>
          <div>Задать фильтр</div>
          <input
            style={{ width: "100%", margin: "10px 0" }}
            name={"from"}
            value={numberFilterValue.from}
            onChange={handleNumberFilterInput}
            placeholder={"Значение, с"}
          />
          <input
            style={{ width: "100%" }}
            name={"to"}
            value={numberFilterValue.to}
            onChange={handleNumberFilterInput}
            placeholder={"Значение, по"}
          />
        </div>
      ) : null}
    </ul>
  );
};
