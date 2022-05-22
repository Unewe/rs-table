import {Row} from "../table/Table";
import {useMemo} from "react";

const groupBy = (rows: Array<Row>, groupBy: keyof Row): Record<string, Array<Row>> => {
  return rows.reduce((acc: Record<string, Array<Row>>, value) => {
    acc[value[groupBy] as string] = acc[value[groupBy] as string] ? [...acc[value[groupBy] as string], value] : [value];
    return acc;
  }, {});
}

const useParseData = (data: Array<Row>,
                      expanded: Record<string | number, boolean>,
                      group?: string,
                      tree?: string): [Array<Row>, Array<Row>, Record<string, Array<Row>>] => {
  return useMemo(() => {
    if (group && tree) {
      console.warn("Select only 1 option, Group or Tree!")
    }

    if (group) {
      const grouped = groupBy(data, group);
      const visible = Object.keys(grouped).map(key => {
        const groupRows: Array<Row> = [{
          type: "__GroupRow",
          id: `Group:${key}`,
          count: grouped[key].length,
          name: key
        }];

        if (expanded[key]) {
          groupRows.push(...grouped[key]);
        }

        return groupRows;
      }).flat();

      return [visible, data, grouped];
    }

    return [data, data, {}];
  }, [data, expanded, group, tree]);
}

export default useParseData;