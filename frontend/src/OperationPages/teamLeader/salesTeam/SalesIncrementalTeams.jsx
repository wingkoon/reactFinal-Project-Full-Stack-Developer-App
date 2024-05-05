import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useContext, useState } from "react";
import { useEffect } from "react";
import moment from "moment";
import "../../../styles/operation.css";
import EditSales from "../../../Agent/SalesProcess/editSale/EditSales";
import DeleteSale from "../../../Agent/SalesProcess/deleteSale/DeleteSale";
import OperatingAverageSaleTeam from "./OperatingAverageSaleTeam";
import { GeneralContext } from "../../../App";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    fontSize: "15px",
    padding: "5px",
    margin: "5px",
    textAlign: "center",
    width: "100px",
    border: "1px solid white",
    borderRadius: "8px 8px 0 0",
    textShadow: "1px 1px 6px white",
    boxShadow: "1px 1px 3px 1px white",
  },
  [`&.${tableCellClasses.body}`]: {
    padding: "5px",
    margin: "5px",
    fontSize: "16px",
    fontWeight: "bold",
    width: "100px",
    textAlign: "center",
    border: "1px solid black",
    boxShadow: "1px 1px 8px  1px black",
    textShadow: "1px 1px 6px black",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },

  "&:last-child td, &:last-child th": {
    border: "1px solid black",
    textAlign: "center",
  },
}));

export default function SalesIncrementalTeams() {
  const [seller, setSeller] = useState([]);
  const { snackbar } = useContext(GeneralContext);
  useEffect(() => {
    const token = localStorage.token;
    if (!token) {
      window.location.href = "/login";
    }
    fetch(`http://localhost:4000/api/operationTeamSale`, {
      credentials: "include",
      method: "GET",
      headers: {
        "Content-type": "application/json",
        Authorization: localStorage.token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setSeller(data);
        snackbar(
          data.message
            ? data.message
            : `המכירות של הצוות ${seller[0]?.teamName} נטענו בהצלחה !`
        );
      });
  }, []);

  return (
    <>
      {!seller.length ? (
        <div className="titleOperationAndAgents">
          <h3>{`אין עדין מכירות להיום`}</h3>
        </div>
      ) : (
        <>
          <div className="titleOperationAndAgents">
            <h3>{`המכירות של צוות ${
              seller[0]?.teamName
            } היום : ${moment().format("DD/MM/YY")}`}</h3>
          </div>
          {
            <TableContainer component={Paper} id="container">
              <div className="btnGroup"></div>
              <Table sx={{ minWidth: 700 }} aria-label="customized table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>תאריך ביצוע</StyledTableCell>
                    <StyledTableCell>שם צוות</StyledTableCell>
                    <StyledTableCell>שם נציג</StyledTableCell>
                    <StyledTableCell align="right">קוד לקוח</StyledTableCell>
                    <StyledTableCell align="right">מכר - Fiber</StyledTableCell>
                    <StyledTableCell align="right">מכר - TV</StyledTableCell>
                    <StyledTableCell align="right">EasyMesh</StyledTableCell>
                    <StyledTableCell align="right">שדרוג</StyledTableCell>
                    <StyledTableCell align="right">ביצועים</StyledTableCell>
                    <StyledTableCell align="right">עדכון פרטים</StyledTableCell>
                    <StyledTableCell align="right">מחיקת מכירה</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(seller) &&
                    seller.map((seller, index) => (
                      <StyledTableRow key={seller.id || index}>
                        <StyledTableCell component="th" scope="row">
                          {moment(seller.createTime).format("DD/MM/YYYY")}
                        </StyledTableCell>
                        <StyledTableCell component="th" scope="row">
                          {seller.teamName}
                        </StyledTableCell>
                        <StyledTableCell component="th" scope="row">
                          {seller.nameAgent}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {seller.customerCode}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {seller.sellerFiber}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {seller.sellerTV}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {seller.easyMesh}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {seller.upgradeProgress}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {seller.sellerFiber +
                            seller.sellerTV +
                            seller.easyMesh +
                            seller.upgradeProgress}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          <EditSales
                            theIDoperationSale={seller.bizNumber}
                            dataOperationSale={seller}
                          />
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          <DeleteSale
                            theIDoperationSale={seller.bizNumber}
                            dataOperationSale={seller}
                          />
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          }
          <div className="titleOperationAndAgents">
            <h3
              style={{
                fontSize: "20px",
              }}>{`פעולות הצוות היום : ${moment().format("DD/MM/YYYY")}`}</h3>
          </div>
          <OperatingAverageSaleTeam />
        </>
      )}
    </>
  );
}
