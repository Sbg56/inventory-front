import ErrorIcon from "@mui/icons-material/ErrorOutline";
import {Box, Typography} from "@mui/material";

interface ErrorProps {
    content: string;
}

export default function ErrorBlock(props: ErrorProps) {

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: 'center',
            width: "100%",
            py: 4
        }}>
            <ErrorIcon color={"error"} sx={{fontSize: 60, color: 'text.error', mb: 2}}/>
            <Typography variant={"h6"} color={"info"}>
                {props.content}
            </Typography>
        </Box>

    )

}