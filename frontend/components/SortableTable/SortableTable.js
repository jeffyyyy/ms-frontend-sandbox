import React from 'react';
import styles from './SortableTable.css';

const ASC = 1;
const DESC = 2;
const UNSORTED = 3;

const HeaderSortIcons = ({status}) => {
  return (
    <div className={styles.arrowWrapper}>
      {status === UNSORTED && (
        <div>
          <div className={styles.arrowUp} />
          <div className={styles.arrowDown} />
        </div>
      )}
      {status < UNSORTED && (
        <div>
          <div className={`${styles.arrowUp} ${status === ASC ? styles.arrowUpActive : 'invisible'}`} />
          <div className={`${styles.arrowDown} ${status === DESC ? styles.arrowDownActive : 'invisible'}`} />
        </div>
      )}
    </div>
  );
};

const HeaderSortNumbers = ({order, field}) => {
  if (order.length < 2 || order.indexOf(field) < 0) {
    return null;
  }
  return (
    <span className={styles.sortNumber}>
      {order.indexOf(field) + 1}
    </span>
  )
};

class SortableTable extends React.Component {
  constructor(props) {
    super(props);
    this.initializeState = this.initializeState.bind(this);
    this.changeSortOrder = this.changeSortOrder.bind(this);
    this.sortRows = this.sortRows.bind(this);
    this.state = {
      order: this.props.initialSortField || [],
      ...this.initializeState(this.props.headers, this.props.initialSortField)
    };
  }
  initializeState(headers, initialSortField = []) {
    const state = {};
    headers.map(h => {
      state[h] = initialSortField.indexOf(h) > -1 ? ASC : UNSORTED;
    });
    return state;
  }

  /*
    Every column has a local state value or 1(ASC) or 2(DESC) or 3(Not sorted), which represent their current sorting order
    Also there is a order array recoding the orders of sorting multiple columns
   */
  changeSortOrder(e, field) {
    if (this.props.disableSortField.indexOf(field) > -1) {
      return;
    }
    const isCtrlOrAltKeyDown = e.ctrlKey || e.altKey;
    const currentSortValue = this.state[field];
    let nextSortValue = currentSortValue + 1;
    if (nextSortValue > UNSORTED) {
      nextSortValue = ASC;
    }
    let obj = {
      order: this.state.order
    };
    if (isCtrlOrAltKeyDown) {
      if (obj.order.indexOf(field) < 0 && nextSortValue !== UNSORTED) {
        obj.order.push(field);
      } else if (obj.order.indexOf(field) >= 0 && nextSortValue === UNSORTED) {
        const itemIndex = obj.order.indexOf(field);
        obj.order.splice(itemIndex, 1);
      }
    } else {
      obj = {
        order: nextSortValue !== UNSORTED ? [field] : [],
        ...this.initializeState(this.props.headers)
      }
    }
    obj[field] = nextSortValue;
    this.setState(obj);
  }

  /*
    Sort rows by single or multiple orders
   */
  sortRows(rows, order, index = 0) {
    if (!order || !order.length || order.length === index) {
      return rows;
    }
    let copyOfOrder = order;
    const currentOrder = copyOfOrder[index];
    const currentOrderValue = this.state[currentOrder];
    const parentOrders = index > 0 ? copyOfOrder.slice(0, index) : [];
    const sortedRows = rows.sort((a, b) => {
      if (parentOrders.length) {
        let areParentOrdersSame = true;
        parentOrders.map(field => {
          if (a[field] !== b[field]) {
            areParentOrdersSame = false;
          }
        });
        if (!areParentOrdersSame) {
          return 0;
        }
      }
      switch (currentOrderValue) {
      case ASC:
        if (a[currentOrder] < b[currentOrder]) {
          return -1;
        } else if (a[currentOrder] === b[currentOrder]) {
          return 0;
        }
        return 1;
      case DESC:
        if (a[currentOrder] > b[currentOrder]) {
          return -1
        } else if (a[currentOrder] === b[currentOrder]) {
          return 0;
        }
        return 1;
      case UNSORTED:
      default:
        return 0;
      }
    });
    return this.sortRows(sortedRows, order, index+1);
  }
  render() {
    const { headers, rows, disableSortField } = this.props;
    const sortedRows = this.sortRows(rows, this.state.order);
    return (
      <table className="table">
        <thead>
        <tr>
          {
            headers.map(key => {
              return (
                <th key={key} onClick={e => this.changeSortOrder(e, key)}>
                  <span>{key}</span>
                  <HeaderSortNumbers order={this.state.order} field={key} />
                  {disableSortField.indexOf(key) < 0 && (
                    <HeaderSortIcons status={this.state[key]} />
                  )}
                </th>
              )
            })
          }
        </tr>
        </thead>
        <tbody>
        {
          sortedRows.map((row, index) => {
            return (
              <tr key={index}>
                {
                  headers.map(h => {
                    return (<td key={`${h}-${index}`}>{row[h]}</td>);
                  })
                }
              </tr>
            )
          })
        }
        </tbody>
      </table>
    );
  }
}

SortableTable.defaultProps = {
  initialSortField: [], // define default sorting column
  disableSortField: []  // define columns which isn't sortable
};

SortableTable.propTypes = {
  initialSortField: React.PropTypes.array,
  disableSortField: React.PropTypes.array,
  headers: React.PropTypes.array.isRequired,
  rows: React.PropTypes.array.isRequired
};

export default SortableTable;
