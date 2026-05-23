import React from 'react';
import { styled } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar'; // Переименуем импорт
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import {Button} from "@mui/material";

const drawerWidth = 240;

const AppBarStyled = styled(MuiAppBar, { // Переименуем styled компонент
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginRight: drawerWidth,
    }),
}));

export function AppBar({ open, onDrawerOpen }) {
    return (
        <AppBarStyled position="fixed" open={open}> {/* Используем переименованный компонент */}
            <Toolbar>
                <Typography variant="h6" noWrap sx={{ flexGrow: 1 }} component="div">
                    Учёт товаров
                </Typography>
                <Button
                    color="inherit"
                    aria-label="open drawer"
                    edge="end"
                    onClick={onDrawerOpen}
                    sx={{ ...(open && { display: 'none' }) }}
                >
                    Меню
                </Button>
            </Toolbar>
        </AppBarStyled>
    );
}