import Layout from "../../shared/ui/layout/Layout";
import EmployeeTable from "./EmployeeTable";

export default function Employees() {
    return (
        <Layout titlePage="Сотрудники">
            <EmployeeTable />
        </Layout>
    );
}