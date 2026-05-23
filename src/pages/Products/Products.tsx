
import ProductTable from ".//ProductTable"
import Layout from "../../shared/ui/layout/Layout";

export default function Products() {
    return (
        <>
            <Layout titlePage={"Товары"}>
                <ProductTable />
            </Layout>
        </>

    )
}