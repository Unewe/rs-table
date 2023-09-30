import { useMemo } from "react";
import { TechRow, Row, Sort, ParsedData, Filter } from "../components";

/**
 * Группировка строк по названию свойства.
 * @param rows строки.
 * @param groupBy свойство для группировки.
 */
const groupBy = <T>(rows: Array<T>, groupBy: keyof T): Record<string, Array<T>> => {
  return rows.reduce((acc: Record<string, Array<T>>, value) => {
    acc[value[groupBy] as any] = acc[value[groupBy] as any] ? [...acc[value[groupBy] as any], value] : [value];
    return acc;
  }, {});
};

/**
 * Сортировка строк.
 * @param rows строки.
 * @param sort сортировка.
 * @param filter фильтрация.
 */
const prepareRows = <T>(rows: Array<T>, sort?: Sort<T>, filter?: Filter<T>): Array<T> => {
  let tmp = rows;

  if (sort) {
    tmp = tmp.sort((a, b) => {
      let result: number;
      if (sort.function) {
        result = sort.function(a, b);
      } else {
        result = a[sort.key] > b[sort.key] ? 1 : -1;
      }

      if (sort.direction === "desc") {
        result = result * -1;
      }

      return result;
    });
  }

  if (filter) {
    tmp = tmp.filter(value => filter.predicate(value[filter.key]));
  }

  return tmp;
};

/**
 * Подготовка данных к выводу в таблице.
 * @param data данные.
 * @param expanded данные по раскрытым элементам.
 * @param group поле группировки.
 * @param tree поле для построения дерева.
 * @param sort сортировка.
 * @param filter фильтрация.
 *
 * @return [видимые элементы, все элементы, группированные строки]
 */
function useParseData<T extends Row>(
  data: Array<T>,
  expanded: Record<Row["id"], boolean>,
  group?: keyof T,
  tree?: keyof T,
  sort?: Sort<T>,
  filter?: Filter<T>
): ParsedData<T> {
  return useMemo(() => {
    if (group && tree) {
      console.warn("Выберите только одну опцию group или tree.");
    }

    let tmp: ParsedData<T> | undefined;

    if (group) {
      const grouped = groupBy(data, group);

      const visible: Array<T | TechRow<T>> = [];
      const all: Array<T | TechRow<T>> = [];

      Object.keys(grouped).forEach(key => {
        const groupRow: TechRow = {
          $type: "_GroupRow",
          $id: `Group:${key}`,
          $count: grouped[key].length,
          $name: key,
          id: `Group:${key}`,
        };

        all.push(groupRow);
        all.push(...prepareRows([...grouped[key]], sort, filter));

        visible.push(groupRow);
        if (expanded[key]) {
          visible.push(...prepareRows([...grouped[key]], sort, filter));
        }
      });

      tmp = { visible, all, grouped, allSelected: {} };
    } else if (tree) {
      const visible: Array<T> = [];
      const all: Array<T> = [];

      const unfold = (rows: Array<T>, level: number = 0, show: boolean = true): void => {
        rows.forEach(row => {
          const item = { ...row, $level: level };

          if (show) {
            visible.push(item);
          }

          all.push(item);
          const children = row[tree];
          if (Array.isArray(children)) {
            unfold(prepareRows([...children], sort, filter), level + 1, Boolean(show && expanded[row.id]));
          }
        });
      };
      unfold(prepareRows([...data], sort, filter));
      tmp = { visible, all, allSelected: {}, grouped: {} };
    } else {
      const visible = prepareRows([...data], sort, filter);
      tmp = { visible, all: visible, allSelected: {}, grouped: {} };
    }

    // Формируем объект с выбранными значениями.
    tmp.allSelected = tmp.all.reduce<Record<string | number, boolean>>((acc, value) => {
      acc[value.id] = true;
      return acc;
    }, {});

    return tmp;
  }, [data, expanded, group, tree, sort, filter]);
}

export default useParseData;
