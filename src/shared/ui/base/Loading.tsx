import Box from "@mui/material/Box";
import {CircularProgress, Typography} from "@mui/material";


interface LoadingProps {
    content: string;
}

export default function Loading(props: LoadingProps) {
    return (
        <Box sx={{ display: 'flex', height: "100vh", flexDirection: 'column', justifyContent: "center", textAlign: 'center', alignItems: 'center' }}>
            <CircularProgress size={"4em"} />
            <Typography variant={"h6"} sx={{mt: 2}}>{props.content}</Typography>
        </Box>
    )
}