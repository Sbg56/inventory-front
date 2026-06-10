import * as React from "react";
import {Box, Container, CssBaseline,} from "@mui/material";
import Sidebar, {DrawerHeader} from "../../../widgets/Sidebar/Sidebar";


interface LayoutProps {
    titlePage: string;
    children: React.ReactNode
}

export default function Layout(props: LayoutProps) {
    return (
        <Box sx={{display: "flex", height: "100vh"}}>
            <CssBaseline/>
            <Sidebar titlePage={props.titlePage} />
            <Box sx={{display: "flex", flexDirection: "column", width: "100%"}}>
                <DrawerHeader/>
                <Box component={"main"}
                     sx={{p: 1, m: 1}}>
                    <Box component={"section"}>
                        <Container sx={{minWidth: "100%"}}>
                            {props.children}
                        </Container>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}