import {Row, Sort} from "../table/Table";
import {useMemo} from "react";

const groupBy = (rows: Array<Row>, groupBy: keyof Row): Record<string, Array<Row>> => {
  return rows.reduce((acc: Record<string, Array<Row>>, value) => {
    acc[value[groupBy] as string] = acc[value[groupBy] as string] ? [...acc[value[groupBy] as string], value] : [value];
    return acc;
  }, {});
}

const sortRows = (rows: Array<Row>, sort?: Sort) => {
  if (!sort) return rows;

  return rows.sort((a, b) => {
    let result: number;
    if (sort.function) {
      result = sort.function(a, b);
    } else {
      // @ts-ignore comparing unknown types.
      result = a[sort.key] > b[sort.key] ? 1 : -1;
    }

    if (sort.direction === "desc") {
      result = result * -1;
    }

    return result;
  });
}

const useParseData = (
  data: Array<Row>,
  expanded: Record<string | number, boolean>,
  group?: string,
  tree?: string,
  sort?: Sort
): [Array<Row>, Array<Row>, Record<string, Array<Row>>] => {
  return useMemo(() => {
    if (group && tree) {
      console.warn("Select only 1 option, Group or Tree!");
    }

    if (group) {
      const grouped = groupBy(data, group);

      const visible: Array<Row> = [];
      const all: Array<Row> = [];

      Object.keys(grouped).forEach(key => {
        const groupRow: Row = {
          type: "_GroupRow",
          id: `Group:${key}`,
          count: grouped[key].length,
          name: key
        };

        all.push(groupRow);
        all.push(...sortRows([...grouped[key]], sort));

        visible.push(groupRow);
        if (expanded[key]) {
          visible.push(...sortRows([...grouped[key]], sort));
        }
      });

      return [visible.flat(), all.flat(), grouped];
    } else if (tree) {
      const visible: Array<Row> = [];
      const all: Array<Row> = [];

      const unfold = (rows: Array<Row>, level: number = 0, show: boolean = true) => {
        rows.forEach(row => {
          const item = {...row, "_level": level};

          if (show) {
            visible.push(item);
          }

          all.push(item);
          const children = row[tree];
          if (Array.isArray(children)) {
            unfold(sortRows([...children], sort), level + 1, Boolean(show && expanded[row.id]));
          }
        });
      };
      unfold(sortRows([...data], sort));
      return [visible, all, {}];
    }

    const tmp = sortRows([...data], sort);
    return [tmp, tmp, {}];
  }, [data, expanded, group, tree, sort]);
}

export default useParseData;