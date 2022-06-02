import {Row} from "../table/Table";
import {useMemo} from "react";

const groupBy = (rows: Array<Row>, groupBy: keyof Row): Record<string, Array<Row>> => {
  return rows.reduce((acc: Record<string, Array<Row>>, value) => {
    acc[value[groupBy] as string] = acc[value[groupBy] as string] ? [...acc[value[groupBy] as string], value] : [value];
    return acc;
  }, {});
}

const useParseData = (
  data: Array<Row>,
  expanded: Record<string | number, boolean>,
  group?: string,
  tree?: string): [Array<Row>, Array<Row>, Record<string, Array<Row>>] => {
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
        all.push(...grouped[key]);

        visible.push(groupRow);
        if (expanded[key]) {
          visible.push(...grouped[key]);
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
            unfold(children, level + 1, Boolean(show && expanded[row.id]));
          }
        });
      };
      unfold(data);

      return [visible, all, {}];
    }

    return [data, data, {}];
  }, [data, expanded, group, tree]);
}

export default useParseData;