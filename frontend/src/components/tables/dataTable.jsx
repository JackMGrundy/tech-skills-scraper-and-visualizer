import React, { Component } from "react";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import TableCell from "@material-ui/core/TableCell";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Paper from "@material-ui/core/Paper";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { AutoSizer, Column, SortDirection, Table } from "react-virtualized";

import BookmarkIcon from "@material-ui/icons/Bookmark";
import LabelIcon from "@material-ui/icons/Label";
import PolymerIcon from "@material-ui/icons/Polymer";
import VisibilityIcon from "@material-ui/icons/Visibility";
import WavesIcon from "@material-ui/icons/Waves";

import colors from "../../style/colors";

const styles = theme => ({
  table: {
    fontFamily: theme.typography.fontFamily
  },
  flexContainer: {
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box"
  },
  tableRow: {
    cursor: "pointer"
  },
  tableRowHover: {
    "&:hover": {
      backgroundColor: theme.palette.grey[200]
    }
  },
  tableCell: {
    flex: 1
  },
  noClick: {
    cursor: "initial"
  }
});

class MuiVirtualizedTable extends React.PureComponent {
  getRowClassName = ({ index }) => {
    const { classes, rowClassName, onRowClick } = this.props;

    return classNames(classes.tableRow, classes.flexContainer, rowClassName, {
      [classes.tableRowHover]: index !== -1 && onRowClick != null
    });
  };

  cellRenderer = ({ cellData, columnIndex = null }) => {
    const { columns, classes, rowHeight, onRowClick } = this.props;
    return (
      <TableCell
        component="div"
        className={classNames(classes.tableCell, classes.flexContainer, {
          [classes.noClick]: onRowClick == null
        })}
        variant="body"
        style={{ height: rowHeight }}
        align={
          (columnIndex != null && columns[columnIndex].numeric) || false
            ? "right"
            : "left"
        }
      >
        {columns[columnIndex].type === "link" ? (
          <a href={cellData} target="_blank" rel="noopener noreferrer">
            Link
          </a>
        ) : columns[columnIndex].type === "button" ? (
          <button
            onClick={() =>
              columns[columnIndex].onClick([
                columns[columnIndex],
                cellData,
                columns
              ])
            }
            className="btn btn-primary btn-sm"
          >
            cellData
          </button>
        ) : (
          <p>{cellData}</p>
        )}
      </TableCell>
    );
  };

  headerRenderer = ({ label, columnIndex, dataKey, sortBy, sortDirection }) => {
    const { headerHeight, columns, classes, sort } = this.props;
    const direction = {
      [SortDirection.ASC]: "asc",
      [SortDirection.DESC]: "desc"
    };

    const inner =
      !columns[columnIndex].disableSort && sort != null ? (
        <TableSortLabel
          active={dataKey === sortBy}
          direction={direction[sortDirection]}
        >
          {label}
        </TableSortLabel>
      ) : (
        label
      );

    return (
      <TableCell
        component="div"
        className={classNames(
          classes.tableCell,
          classes.flexContainer,
          classes.noClick
        )}
        variant="head"
        style={{ height: headerHeight }}
        align={columns[columnIndex].numeric || false ? "right" : "left"}
      >
        {inner}
      </TableCell>
    );
  };

  render() {
    const { classes, columns, ...tableProps } = this.props;
    return (
      <AutoSizer>
        {({ height, width }) => (
          <Table
            className={classes.table}
            height={height}
            width={width}
            {...tableProps}
            rowClassName={this.getRowClassName}
          >
            {columns.map(
              (
                { cellContentRenderer = null, className, dataKey, ...other },
                index
              ) => {
                let renderer;
                if (cellContentRenderer != null) {
                  renderer = cellRendererProps =>
                    this.cellRenderer({
                      cellData: cellContentRenderer(cellRendererProps),
                      columnIndex: index
                    });
                } else {
                  renderer = this.cellRenderer;
                }

                return (
                  <Column
                    key={dataKey}
                    headerRenderer={headerProps =>
                      this.headerRenderer({
                        ...headerProps,
                        columnIndex: index
                      })
                    }
                    className={classNames(classes.flexContainer, className)}
                    cellRenderer={renderer}
                    dataKey={dataKey}
                    {...other}
                  />
                );
              }
            )}
          </Table>
        )}
      </AutoSizer>
    );
  }
}

MuiVirtualizedTable.defaultProps = {
  headerHeight: 56,
  rowHeight: 75
};

const WrappedVirtualizedTable = withStyles(styles)(MuiVirtualizedTable);

class ReactVirtualizedTable extends Component {
  render() {
    const {
      columns,
      data,
      height,
      onRowClick,
      onColumnClick,
      header,
      footer
    } = this.props;

    return (
      <Card>
        <CardContent>
          <div className="header">
            <br />
            {header ? (
              <PolymerIcon
                style={{
                  transform: "scale(3)",
                  // color: "#43a047",
                  color: colors.primary,
                  float: "left",
                  // width: "200px",
                  width: "100%",
                  height: "75px",
                  // height: "100%",
                  // background: "#8e8e8e",
                  background: colors.background
                }}
              />
            ) : (
              ""
            )}
            <h2
              className="mb-5"
              style={{
                position: "relative",
                top: "18px",
                left: "10px",
                color: "white"
              }}
            >
              {header}
            </h2>{" "}
          </div>
          {data.length > 0 ? (
            <Paper style={{ height: height, width: "100%" }}>
              <WrappedVirtualizedTable
                rowCount={data.length ? data.length : 0}
                rowGetter={({ index }) => data[index]}
                onRowClick={onRowClick ? event => onRowClick(event) : null}
                onColumnClick={
                  onColumnClick ? event => onColumnClick(event) : null
                }
                columns={columns}
              />
            </Paper>
          ) : (
            ""
          )}
          <br />
          <small>{data.length > 0 ? footer : ""}</small>
        </CardContent>
      </Card>
    );
  }
}

export default ReactVirtualizedTable;
