
import Layout from "../../shared/ui/layout/Layout";
import ProductTable from "./ProductTable";

export default function Products() {
    return (
        <>
            <Layout titlePage={"Товары"} >
                <ProductTable />
            </Layout>
        </>

    )
}