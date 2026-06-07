import {Link, useLocation} from "react-router-dom"
import {styled, useTheme, type Theme, type CSSObject} from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, {type AppBarProps as MuiAppBarProps} from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import type {topMenuItems, bottomMenuItems} from "./sidebarMenuType.ts";
import HistoryIcon from '@mui/icons-material/History';
import InfoIcon from '@mui/icons-material/Info';
import {useLocalStorage} from "../../shared/hook/useLocalStorage";
import WarehouseIcon from '@mui/icons-material/Warehouse';
import CategoryIcon from '@mui/icons-material/Category';
import DescriptionIcon from '@mui/icons-material/Description';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PeopleIcon from '@mui/icons-material/People';
import TrolleyIcon from '@mui/icons-material/Trolley';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useKeycloak } from '@react-keycloak/web';
import LogoutIcon from '@mui/icons-material/Logout';
import Divider from '@mui/material/Divider';
import { useRole, type UserRole } from '../../shared/auth/useRole';

const drawerWidth = 320;

interface sidebarProps {
    titlePage: string;
}

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

export const DrawerHeader = styled('div')(({theme}) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({theme}) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    variants: [
        {
            props: ({open}) => open,
            style: {
                marginLeft: drawerWidth,
                width: `calc(100% - ${drawerWidth}px)`,
                transition: theme.transitions.create(['width', 'margin'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            },
        },
    ],
}));

const Drawer = styled(MuiDrawer, {shouldForwardProp: (prop) => prop !== 'open'})(
    ({theme}) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        variants: [
            {
                props: ({open}) => open,
                style: {
                    ...openedMixin(theme),
                    '& .MuiDrawer-paper': openedMixin(theme),
                },
            },
            {
                props: ({open}) => !open,
                style: {
                    ...closedMixin(theme),
                    '& .MuiDrawer-paper': closedMixin(theme),
                },
            },
        ],
    }),
);

/** Пункт меню с ограничением по ролям */
interface MenuItemDef {
    id: number;
    path: string;
    label: string;
    icon: React.ReactNode;
    enabled: boolean;
    /** Если задано — пункт виден только пользователям с этими ролями */
    allowedRoles?: UserRole[];
}

const bottomMenuItemsList: bottomMenuItems[] = [
    {id: 1, path: "/about", label: "Справка", icon: <InfoIcon/>},
]

export default function Sidebar(props: sidebarProps) {

    const theme = useTheme();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useLocalStorage<boolean>('isMenuOpen', false);
    const { hasRole } = useRole();
    const { keycloak } = useKeycloak();

    const username = keycloak.tokenParsed?.preferred_username as string | undefined;

    const handleLogout = () => {
        keycloak.logout({ redirectUri: window.location.origin });
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    }

    const isActive = (path: string) => location.pathname === path;

    const allMenuItems: MenuItemDef[] = [
        {
            id: 1, path: "/trade",
            label: "Учёт",
            icon: <DescriptionIcon/>,
            enabled: true,
            // Доступно всем
        },
        {
            id: 2, path: "/",
            label: "Товары",
            icon: <CategoryIcon/>,
            enabled: true,
        },
        {
            id: 3, path: "/warehouses",
            label: "Склады",
            icon: <WarehouseIcon/>,
            enabled: true,
        },
        {
            id: 4, path: "/stockMovement",
            label: "Движение товаров",
            icon: <TrolleyIcon/>,
            enabled: true,
        },
        {
            id: 5, path: "/suppliers",
            label: "Поставщики",
            icon: <LocalShippingIcon/>,
            enabled: true,
        },
        {
            id: 6, path: "/employees",
            label: "Сотрудники",
            icon: <PeopleIcon/>,
            enabled: true,
            allowedRoles: ["ADMIN"],          // только ADMIN
        },
        {
            id: 7, path: "/statistics",
            label: "Статистика",
            icon: <BarChartIcon/>,
            enabled: true,
            allowedRoles: ["ADMIN", "MANAGER"], // ADMIN и MANAGER
        },
        {
            id: 8, path: "/5",
            label: "История",
            icon: <HistoryIcon/>,
            enabled: true,
        },
    ];

    // Фильтруем пункты меню по роли пользователя
    const topMenuItem = allMenuItems.filter((item) =>
        !item.allowedRoles || hasRole(...item.allowedRoles)
    );

    return (
        <Box sx={{display: 'flex'}}>
            <AppBar position="fixed" open={isMenuOpen} sx={{
                borderRadius: 4,
                backgroundColor: '#CB673C',
                boxShadow: '0px 2px 8px rgba(203, 103, 60, 0.15)',
            }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={toggleMenu}
                        edge="start"
                        size={"small"}
                        sx={[
                            {
                                marginRight: 5,
                                border: "1px solid #dddddddd"
                            },
                            isMenuOpen && {display: 'none'},
                        ]}
                    >
                        <ChevronRightIcon/>
                    </IconButton>

                    <Box component={"header"} sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                    }}>
                        <Typography variant={"h5"} sx={{pr: 1}}>
                            {props.titlePage}
                        </Typography>
                    </Box>

                </Toolbar>

            </AppBar>
            <Drawer variant="permanent" open={isMenuOpen}>
                <DrawerHeader sx={{justifyContent: 'space-between'}}>
                    <Typography variant="h6" noWrap sx={{display: 'flex'}}>
                        Учёт товаров
                    </Typography>
                    <IconButton sx={{border: "1px solid #dddddddd"}} size={"small"} onClick={toggleMenu}>
                        {theme.direction === 'rtl' ? <ChevronRightIcon/> : <ChevronLeftIcon/>}
                    </IconButton>
                </DrawerHeader>
                <Box sx={{
                    display: "flex",
                    width: drawerWidth,
                    boxSizing: "border-box",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderTop: "none",
                    height: "100%",
                }}>
                    <Box>
                        <List subheader={
                            <ListSubheader component="div" id="nested-list-subheader">
                                {isMenuOpen ? "Опции" : ""}
                            </ListSubheader>}
                        >
                            {topMenuItem.map((item) => {
                                const selected = isActive(item.path)
                                return (
                                    <ListItem key={item.id} disablePadding
                                              sx={{display: 'flex', alignItems: 'flex-end'}}>
                                        <ListItemButton
                                            disabled={!item.enabled}
                                            component={Link}
                                            to={item.path}
                                            selected={selected}
                                            sx={{
                                                minHeight: 48,
                                                px: 2.5,
                                                '&.Mui-selected': {
                                                    backgroundColor: 'rgba(203, 103, 60, 0.12)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(203, 103, 60, 0.18)',
                                                    },
                                                },
                                            }}
                                        >
                                            <ListItemIcon sx={{ color: selected ? "#CB673C" : "inherit.main" }}>
                                                {item.icon}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={item.label}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                )
                            })}
                        </List>
                    </Box>
                    <Box>
                        <Divider />
                        <List
                            sx={{width: '100%', bgcolor: 'background.paper'}}
                            component="nav"
                            aria-labelledby="nested-list-subheader"
                        >
                            {bottomMenuItemsList.map((item) => {
                                const selected = isActive(item.path)
                                return (
                                    <ListItem key={item.id} disablePadding
                                              sx={{display: 'flex', alignItems: 'flex-end'}}>
                                        <ListItemButton component={Link} to={item.path} selected={selected}>
                                            <ListItemIcon sx={{color: selected ? "primary.main" : "inherit.main"}}>
                                                {item.icon}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={item.label}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                )
                            })}

                            {/* Имя пользователя */}
                            {isMenuOpen && username && (
                                <ListItem sx={{ px: 2.5, py: 0.5 }}>
                                    <ListItemText
                                        primary={username}
                                        slotProps={{
                                            primary: {
                                                variant: 'caption',
                                                sx: { color: 'text.secondary', fontWeight: 500 }
                                            }
                                        }}
                                    />
                                </ListItem>
                            )}

                            {/* Кнопка выхода */}
                            <ListItem disablePadding>
                                <ListItemButton
                                    onClick={handleLogout}
                                    sx={{
                                        minHeight: 48,
                                        px: 2.5,
                                        color: 'error.main',
                                        '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.08)' },
                                    }}
                                >
                                    <ListItemIcon sx={{ color: 'error.main' }}>
                                        <LogoutIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Выйти" />
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </Box>
                </Box>


            </Drawer>
        </Box>
    );
}
