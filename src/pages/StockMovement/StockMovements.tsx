import Layout from "../../shared/ui/layout/Layout";
import {StockMovementTable} from "./StockMovementTable";

export default function StockMovements() {
    return (
        <Layout titlePage="Движение товаров">
            <StockMovementTable />
        </Layout>
    );
}