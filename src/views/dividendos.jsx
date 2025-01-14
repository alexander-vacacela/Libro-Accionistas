import React, { useState, useEffect, Fragment } from 'react'
import { API,Storage,graphqlOperation } from 'aws-amplify';
import { getParametro, listDividendosAccionistas, listAccionistas, listDividendos,listOperaciones,listAccionistaArchives} from '../graphql/queries';


import { makeStyles } from '@material-ui/core/styles';
import { createTheme } from '@material-ui/core/styles';

import { Grid, Typography,  Button, ListItem, ListItemText, ListSubheader, List, Chip, TextField , LinearProgress,
    FormControl,  Box, Tabs, Tab, IconButton, Checkbox, InputLabel,Select, MenuItem, 
    Dialog, DialogActions,DialogContent,DialogTitle, ListItemIcon,Snackbar, CircularProgress, Divider, DialogContentText} from '@material-ui/core';

import { DataGrid, GridToolbar, GRID_CHECKBOX_SELECTION_COL_DEF } from '@mui/x-data-grid';
import PropTypes from 'prop-types';

import PageviewIcon from '@material-ui/icons/Pageview';
import CheckIcon from '@material-ui/icons/Check';
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';
import DeleteIcon from '@material-ui/icons/Delete';
import FunctionsIcon from '@material-ui/icons/Functions';
import DonutLargeIcon from '@material-ui/icons/DonutLarge';
import EditIcon from '@material-ui/icons/Edit';

import { uuid } from 'uuidv4';
import { createDividendos, createDividendosAccionista, updateDividendos, updateDividendosAccionista  } from '../graphql/mutations';
import MuiAlert from '@material-ui/lab/Alert';

import jsPDF from "jspdf";
import "jspdf-autotable";

import logo from '../images/logoUNACEMmedMarco.jpg';

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }
  

const defaultTheme = createTheme();

const useStyles = makeStyles(
  (theme) => ({
    root: {
      padding: theme.spacing(0, 2, 0),
      justifyContent: 'space-between',
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    appBarSpacer: {
      ...theme.mixins.toolbar,
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(2),        
    },
    button: {
        borderRadius: 20,
      }
  }),
  { defaultTheme },
);


export default function Dividendos() {

    const [accionistasCorte, setAccionistasCorte] = useState([])
    const [openAccionistas, setOpenAccionistas] = useState(false);

    const [accionistasCorteDividendos, setAccionistasCorteDividendos] = useState([])
    const [openAccionistasDividendos, setOpenAccionistasDividendos] = useState(false);

    const [cantidadEmitido, setCantidadEmitido] = useState(1);
    const [valorNominal, setValorNominal] = useState(1);
    const [baseImponible, setBaseImponible] = useState(0);
    const [retencionNoResidente, setRetencionNoResidente] = useState(0);

    const [FB1, setFB1] = useState(0);
    const [FB2, setFB2] = useState(0);
    const [FB3, setFB3] = useState(0);
    const [FB4, setFB4] = useState(0);
    const [FB5, setFB5] = useState(0);
    const [FB6, setFB6] = useState(0);

    const [FE1, setFE1] = useState(0);
    const [FE2, setFE2] = useState(0);
    const [FE3, setFE3] = useState(0);
    const [FE4, setFE4] = useState(0);
    const [FE5, setFE5] = useState(0);
    const [FE6, setFE6] = useState(0);

    const [RFB1, setRFB1] = useState(0);
    const [RFB2, setRFB2] = useState(0);
    const [RFB3, setRFB3] = useState(0);
    const [RFB4, setRFB4] = useState(0);
    const [RFB5, setRFB5] = useState(0);
    const [RFB6, setRFB6] = useState(0);

    const [RFE1, setRFE1] = useState(0);
    const [RFE2, setRFE2] = useState(0);
    const [RFE3, setRFE3] = useState(0);
    const [RFE4, setRFE4] = useState(0);
    const [RFE5, setRFE5] = useState(0);
    const [RFE6, setRFE6] = useState(0);

    const [retencionMinima, setRetencionMinima] = useState(0);
    const [retencionMaxima, setRetencionMaxima] = useState(0);

    const [Retencion_PN_Loc, setRetencion_PN_Loc] = useState(0);
    const [Retencion_PN_NPF, setRetencion_PN_NPF] = useState(0);
    const [Retencion_PN_PF, setRetencion_PN_PF] = useState(0);
    const [Retencion_PJ_Loc_Loc, setRetencion_PJ_Loc_Loc] = useState(0);
    const [Retencion_PJ_Loc_NPF, setRetencion_PJ_Loc_NPF] = useState(0);
    const [Retencion_PJ_Loc_PF, setRetencion_PJ_Loc_PF] = useState(0);
    const [Retencion_PJ_PF_Loc, setRetencion_PJ_PF_Loc] = useState(0);
    const [Retencion_PJ_PF_NPF, setRetencion_PJ_PF_NPF] = useState(0);
    const [Retencion_PJ_PF_PF, setRetencion_PJ_PF_PF] = useState(0);
    const [Retencion_PJ_NPF_Loc, setRetencion_PJ_NPF_Loc] = useState(0);
    const [Retencion_PJ_NPF_NPF, setRetencion_PJ_NPF_NPF] = useState(0);
    const [Retencion_PJ_NPF_PF, setRetencion_PJ_NPF_PF] = useState(0);
    
    const handleClose = () => 
    {
        setOpenAccionistas(false);
    }

    const handleCloseAccionistasDividendos = () => 
    {
        setOpenAccionistasDividendos(false);
    }

    

    const [dividendos, setDividendos] = useState([]); 

    function getParticipacion(params) {
        return `${params.getValue(params.id, 'cantidadAcciones') * 100 / cantidadEmitido || ''} `;
    }

    function getDividendo(params) {
        return `${ (params.getValue(params.id, 'cantidadAcciones') * periodoSeleccionado.dividendoRepartir / cantidadEmitido).toFixed(2) || ''} `;
    }

    function getBaseImponible(params) {
        return `${ (params.getValue(params.id, 'cantidadAcciones') * periodoSeleccionado.dividendoRepartir * (baseImponible/100.00) / cantidadEmitido).toFixed(2) || ''} `;
    }
    
    function getRetencion(params) {
        let base = (params.getValue(params.id, 'cantidadAcciones') * periodoSeleccionado.dividendoRepartir * (baseImponible/100.00) / cantidadEmitido).toFixed(2)
        let num = 0;
        if  (base > FB1 && base < FE1) { num = RFB1 + (base - FB1)*RFE1/100.00; }
        if  (base > FB2 && base < FE2) { num = RFB2 + (base - FB2)*RFE2/100.00; }
        if  (base > FB3 && base < FE3) { num = RFB3 + (base - FB3)*RFE3/100.00; }
        if  (base > FB4 && base < FE4) { num = RFB4 + (base - FB4)*RFE4/100.00; }
        if  (base > FB5 && base < FE5) { num = RFB5 + (base - FB5)*RFE5/100.00; }
        if  (base > FB6 && base < FE6) { num = RFB6 + (base - FB6)*RFE6/100.00; } 
        return `${ num.toFixed(2) || ''} `;
    }

    function getNetoRecibir(params) {
        let dividendo = (params.getValue(params.id, 'cantidadAcciones') * periodoSeleccionado.dividendoRepartir / cantidadEmitido).toFixed(2);
        let base = (params.getValue(params.id, 'cantidadAcciones') * periodoSeleccionado.dividendoRepartir * (baseImponible/100.00) / cantidadEmitido).toFixed(2);
        let num = 0;
        if  (base > FB1 && base < FE1) { num = dividendo - (RFB1 + (base - FB1)*RFE1/100.00); }
        if  (base > FB2 && base < FE2) { num = dividendo - (RFB2 + (base - FB2)*RFE2/100.00); }
        if  (base > FB3 && base < FE3) { num = dividendo - (RFB3 + (base - FB3)*RFE3/100.00); }
        if  (base > FB4 && base < FE4) { num = dividendo - (RFB4 + (base - FB4)*RFE4/100.00); }
        if  (base > FB5 && base < FE5) { num = dividendo - (RFB5 + (base - FB5)*RFE5/100.00); }
        if  (base > FB6 && base < FE6) { num = dividendo - (RFB6 + (base - FB6)*RFE6/100.00); } 
        return `${ num.toFixed(2) || ''} `;
    }

    //////////////////////////////

    function getParticipacion1(cantidadAcciones) {
        return ((cantidadAcciones / cantidadEmitido) * 100.00).toFixed(16) ;
    }
    
    function getRetencion1(base, persona, residente, beneficiario) {       
            
        //,e.tipoPersona, e.direccionPais, e.direccionPais
        
        let retencion = 4;         
        let residenciaFiscal = "NPF";
        let residenciaFiscalBenef = "NPF";

        if(residente.trim() == "Ecuador") residenciaFiscal = "Local"
        //if(residente == null) residenciaFiscal = "Local"
        if(residente.trim() == "Panama") residenciaFiscal = "PF"

        if(beneficiario.trim() == "Ecuador") residenciaFiscalBenef = "Local"
        //if(beneficiario == null) residenciaFiscalBenef = "Local"
        if(beneficiario.trim() == "Panama") residenciaFiscalBenef = "PF"

        if (persona == "PN" && residenciaFiscal == "Local") retencion = Retencion_PN_Loc;
        if (persona == "PN" && residenciaFiscal == "NPF") retencion = Retencion_PN_NPF;
        if (persona == "PN" && residenciaFiscal == "PF") retencion = Retencion_PN_PF;
        if (persona == "PJ" && residenciaFiscal == "Local" && residenciaFiscalBenef == "Local") retencion = Retencion_PJ_Loc_Loc;
        if (persona == "PJ" && residenciaFiscal == "Local" && residenciaFiscalBenef == "NPF") retencion = Retencion_PJ_Loc_NPF;
        if (persona == "PJ" && residenciaFiscal == "Local" && residenciaFiscalBenef == "PF") retencion = Retencion_PJ_Loc_PF;
        if (persona == "PJ" && residenciaFiscal == "PF" && residenciaFiscalBenef == "Local") retencion = Retencion_PJ_PF_Loc;
        if (persona == "PJ" && residenciaFiscal == "PF" && residenciaFiscalBenef == "NPF") retencion = Retencion_PJ_PF_NPF;
        if (persona == "PJ" && residenciaFiscal == "PF" && residenciaFiscalBenef == "PF") retencion = Retencion_PJ_PF_PF;
        if (persona == "PJ" && residenciaFiscal == "NPF" && residenciaFiscalBenef == "Local") retencion = Retencion_PJ_NPF_Loc;
        if (persona == "PJ" && residenciaFiscal == "NPF" && residenciaFiscalBenef == "NPF") retencion = Retencion_PJ_NPF_NPF;
        if (persona == "PJ" && residenciaFiscal == "NPF" && residenciaFiscalBenef == "PF") retencion = Retencion_PJ_NPF_PF;
      
        //let num = base*retencionNoResidente/100.00;
        let num = 0;
        
        if(retencion == 1) num = base*retencionMinima/100.00;
        if(retencion == 2) num = base*retencionMaxima/100.00;
        if(retencion == 4) num = 0;

        if(retencion == 3) {        
        if  (base > FB1 && base < FE1) { num = RFB1 + (base - FB1)*RFE1/100.00; }
        if  (base > FB2 && base < FE2) { num = RFB2 + (base - FB2)*RFE2/100.00; }
        if  (base > FB3 && base < FE3) { num = RFB3 + (base - FB3)*RFE3/100.00; }
        if  (base > FB4 && base < FE4) { num = RFB4 + (base - FB4)*RFE4/100.00; }
        if  (base > FB5 && base < FE5) { num = RFB5 + (base - FB5)*RFE5/100.00; }
        if  (base > FB6 && base < FE6) { num = RFB6 + (base - FB6)*RFE6/100.00; } 
        }

        //if(residente.trim() !== "Ecuador") {num = base*retencionNoResidente/100.00;}
        if (persona == "PJ") console.log("RESIDENCIAAAA",persona, residente, base, num, retencion);

        return num.toFixed(2);
    }

    ///////////////////////////



    const [openCrearDividendo, setOpenCrearDividendo] = useState(false);
    const handleCloseCrearDividendo = () => {
        setFormData({
        periodo:  '',
        secuencial: '',
        concepto: '',
        dividendo: 0,
        porcentajeRepartir: 0,
        dividendoRepartir: 0,
        fechaCorte: '',
        fechaPago: '',
        estado: 'Nuevo',
        retencion: 0,
        idDividendoOrigen:  '',
        saldoDividendo: 0,
        saldoPorcentajeDividendo: 0,
        entregado: 0,
        porEntregar: 0,
        });

        setOpenCrearDividendo(false)

    }
    
    const handleOpenCrearDividendo = () => setOpenCrearDividendo(true);

    const handleConfirmarDividendo = async () => {

      //console.log("MATRIZ", accionistasCorte);
      for (const accionistaCorte of accionistasCorte) {
        
        //console.log(accionistaCorte.nombre, accionistaCorte.dividendo, accionistaCorte.baseImponible);

        const dividendoAccionista = {    
          idAccionista: accionistaCorte.id,
          tipoIdentificacion:  accionistaCorte.tipoIdentificacion,
          identificacion: accionistaCorte.identificacion,
          nombre: accionistaCorte.nombre,
          direccionPais: accionistaCorte.direccionPais,
          paisNacionalidad: accionistaCorte.paisNacionalidad,
          cantidadAcciones: accionistaCorte.cantidadAcciones,
          participacion: accionistaCorte.participacion,
          tipoAcciones: accionistaCorte.tipoAcciones,
          estado: accionistaCorte.estado,
          tipoPersona: accionistaCorte.tipoPersona,
          decevale: accionistaCorte.decevale,
          idDividendo: accionistaCorte.idDividendo,
          periodo: accionistaCorte.periodo,
          dividendo: accionistaCorte.dividendo,
          baseImponible: accionistaCorte.baseImponible,
          retencion: accionistaCorte.retencion,
          dividendoRecibido: accionistaCorte.dividendoRecibido,
          estadoDividendo: accionistaCorte.estadoDividendo,
          documento: accionistaCorte.documento,
          solicitado: accionistaCorte.solicitado,
          fechaSolicitud: accionistaCorte.fechaSolicitud,
          HoraSolicitud: accionistaCorte.HoraSolicitud,
          fechaPago: accionistaCorte.fechaPago,
          direccionPaisBeneficiario1: accionistaCorte.direccionPaisBeneficiario1
        
        };

          console.log('input',dividendoAccionista)
          //const apiDataDividendoAccionista = await API.graphql({ query: createDividendosAccionista, variables: { input: dividendoAccionista } });  
          const divAccionsitaID = await API.graphql(graphqlOperation(createDividendosAccionista, { input: dividendoAccionista }))
          const operID  = await API.graphql({ query: updateDividendos, variables: { input: {id: periodoSeleccionado.id,  estado : "Confirmado"} } });

          handleClose();

      }

    }
    const columns = [
        {
          field: 'periodo',
          headerName: 'Periodo',
          width: 100,
        },
        {
          field: 'secuencial',
          headerName: 'Secuencial',
          width: 60,
        }, 
        {
          field: 'concepto',
          headerName: 'Concepto',
          width: 120,
        },               
        {
          field: 'dividendo',
          headerName: 'Total Dividendo',
          type: 'number',
          width: 120,
        },      
        {
          field: 'porcentajeRepartir',
          headerName: 'Reparto Acordado',
          type: 'number',
          width: 100,
        },
        {
          field: 'dividendoRepartir',
          headerName: 'Repartir',
          type: 'number',
          width: 120,
        },  
        {
          field: 'fechaCorte',
          headerName: 'Corte',
          width: 90,
        },
        {
          field: 'fechaPago',
          headerName: 'Junta',
          width: 90,
        },

        /*
        {
            field: 'retencion',
            headerName: 'Retención',
            type: 'number',
            width: 120,
          }, 
           
          {
            field: 'saldoPorcentajeDividendo',
            headerName: 'Saldo %',
            type: 'number',
            width: 100,
          },   
          */
          {
            field: 'saldoDividendo',
            headerName: 'Saldo Div',
            type: 'number',
            width: 120,
          },    
                                                  
        {
          //field: "Quorum",
          field: "Detalle",
          width: 120,
          renderCell: (cellValues) => {

            //setPeriodoSeleccionado(cellValues.row);

            return <Fragment> 
              

            <IconButton  onClick={() =>  
              {
                if(cellValues.row.estado == "Nuevo"){
                fetchAccionistas(cellValues.row);
                setPeriodoSeleccionado(cellValues.row);
                } else {
                  fetchAccionistasDividendos(cellValues.row);
                  setPeriodoSeleccionado(cellValues.row);
                  console.log(cellValues.row)
                }
              }
            } color='primary'><PageviewIcon /></IconButton>
            
            </Fragment>

          }
        },
        {
          field: 'estado',
          headerName: 'Estado',
          width: 110,
          renderCell: (cellValues) => {
            return <Chip size="small" variant="outlined" label={cellValues.row.estado} color={cellValues.row.estado == 'Nuevo' ? 'primary' : 'secondary'} />
          }
      },         

        /*
        {
            field: 'entregado',
            headerName: 'Entregado',
            type: 'number',
            width: 120,
          },   
          {
            field: 'porEntregar',
            headerName: 'Por Entregar',
            type: 'number',
            width: 120,
          },  */           
      ];

      const columnsAccionistasCorte = [
        {
            field: 'identificacion',
            headerName: 'Identificación',
            width: 100,
        },
        {
          field: 'nombre',
          headerName: 'Nombre',
          width: 240,
        },
        {
            field: 'tipoPersona',
            headerName: 'Persona',
            width: 60,
          },              
        {
            field: 'estado',
            headerName: 'Estado',
            width: 100,
            renderCell: (cellValues) => {
              return <Chip size="small" variant="outlined" label={cellValues.row.estado} color={cellValues.row.estado == 'Activo' ? 'primary' : 'secondary'} />
            }
        }, 
        /*        
        {
            field: 'paisNacionalidad',
            headerName: 'Nacionalidad',
            width: 100,
        }, */  
        {
            field: 'direccionPais',
            headerName: 'Residencia',
            width: 100,
        },  
        {
          field: 'direccionPaisBeneficiario1',
          headerName: 'Beneficiario',
          width: 100,
      },  
        {
          field: 'cantidadAcciones',
          headerName: 'Acciones',
          type: 'number',
          width: 100,
        },  
        {
            field: 'participacion',
            headerName: 'Participación',
            type: 'number',
            width: 110,
            //valueGetter: getParticipacion,
        },                   
        {
            field: 'dividendo',
            headerName: 'Dividendo',
            type: 'number',
            width: 110,
            //valueGetter: getDividendo,
          },   
          {
            field: 'baseImponible',
            headerName: 'Base Imponible',
            type: 'number',
            width: 110,
            //valueGetter: getBaseImponible,
          },   
          {
            field: 'retencion',
            headerName: 'Retención',
            type: 'number',
            width: 110,
            //valueGetter: getRetencion,
          },   
          {
            field: 'dividendoRecibido',
            headerName: 'Pagar',
            type: 'number',
            width: 110,
            //valueGetter: getNetoRecibir,
          },       
 
          /*
          {
            field: 'saldoDividendoPeriodo',
            headerName: 'Saldo Dividendo',
            type: 'number',
            width: 110,
            //valueGetter: getNetoRecibir,
          },  
          */
          
          
      ];

      const columnsAccionistasCorteDividendos = [
        {
            field: 'identificacion',
            headerName: 'Identificación',
            width: 100,
        },
        {
          field: 'nombre',
          headerName: 'Nombre',
          width: 240,
        },
        {
            field: 'tipoPersona',
            headerName: 'Persona',
            width: 60,
          },              
        {
            field: 'estado',
            headerName: 'Estado',
            width: 100,
            renderCell: (cellValues) => {
              return <Chip size="small" variant="outlined" label={cellValues.row.estado} color={cellValues.row.estado == 'Activo' ? 'primary' : 'secondary'} />
            }
        }, 
        {
            field: 'direccionPais',
            headerName: 'Residencia',
            width: 100,
        },  
        {
          field: 'direccionPaisBeneficiario1',
          headerName: 'Beneficiario',
          width: 100,
      },  
        {
          field: 'cantidadAcciones',
          headerName: 'Acciones',
          //type: 'number',
          width: 100,
          align:'right',
        },  
        {
            field: 'participacion',
            headerName: 'Participación',
            //type: 'number',
            width: 110,
            //valueGetter: getParticipacion,
        },                   
        {
            field: 'dividendo',
            headerName: 'Dividendo',
            //type: 'number',
            width: 110,
            align:'right',
          },   
          {
            field: 'baseImponible',
            headerName: 'Base Imponible',
            //type: 'number',
            width: 110,
            align:'right',
          },   
          {
            field: 'retencion',
            headerName: 'Retención',
            //type: 'number',
            width: 110,
            align:'right',
          },   
          {
            field: 'dividendoRecibido',
            headerName: 'Pagar',
            //type: 'number',
            width: 110,
            align:'right',
          },       
 
          {
            field: 'solicitado',
            headerName: '50%',
            width: 50,
            renderCell: (cellValues) => {
              return <Chip size="small" variant="outlined" label={cellValues.row.solicitado} color={cellValues.row.solicitado == true ? 'primary' : 'secondary'} />
            }
        }, 


          {
            field: "50%",
            width: 50,
            renderCell: (cellValues) => {
   
              return <Fragment> 
                
              <IconButton  onClick={() =>  
                {
                  console.log(cellValues.row);
                  fetchAccionista50(cellValues.row);
                  //setPeriodoSeleccionado(cellValues.row);
                }
              } color='primary'><EditIcon /></IconButton>
              
              </Fragment>
  
            }
          },
  

          /*
          {
            field: 'saldoDividendoPeriodo',
            headerName: 'Saldo Dividendo',
            type: 'number',
            width: 110,
            //valueGetter: getNetoRecibir,
          },  
          */
          
          
      ];

    

    const [rows, setRows] = useState([]);

    const [periodoSeleccionado, setPeriodoSeleccionado]= useState({});

    const [openSnack, setOpenSnack] = useState(false);
    
    const [circular, setCircular] = useState(false);

    const[refrescar, setRefrescar]=useState(false);
  

    useEffect(() => {

    fetchParametros();
    fetchDividendos();
    //fetchTodosAccionistas();
    //if (periodoSeleccionado.id) refrescarAccionistas();
    fetchOperaciones();

    }, [refrescar]);
     
  
      async function fetchParametros() {
  
        const apiData = await API.graphql({ query: getParametro , variables: { id: '1' } });
  
        const parametrosFromAPI = apiData.data.getParametro;    
  
        //console.log("PARAMETROS",parametrosFromAPI);

        setCantidadEmitido(parametrosFromAPI.cantidadEmitida);
        setValorNominal(parametrosFromAPI.valorNominal);

        setBaseImponible(parametrosFromAPI.baseImponible);
        setRetencionNoResidente(parametrosFromAPI.noResidente);

        setFB1(parametrosFromAPI.IGdesde1);
        setFB2(parametrosFromAPI.IGdesde2);
        setFB3(parametrosFromAPI.IGdesde3);
        setFB4(parametrosFromAPI.IGdesde4);
        setFB5(parametrosFromAPI.IGdesde5);
        setFB6(parametrosFromAPI.IGdesde6);

        setFE1(parametrosFromAPI.IGhasta1);
        setFE2(parametrosFromAPI.IGhasta2);
        setFE3(parametrosFromAPI.IGhasta3);
        setFE4(parametrosFromAPI.IGhasta4);
        setFE5(parametrosFromAPI.IGhasta5);
        setFE6(parametrosFromAPI.IGhasta6);

        setRFB1(parametrosFromAPI.FBretencion1);
        setRFB2(parametrosFromAPI.FBretencion2);
        setRFB3(parametrosFromAPI.FBretencion3);
        setRFB4(parametrosFromAPI.FBretencion4);
        setRFB5(parametrosFromAPI.FBretencion5);
        setRFB6(parametrosFromAPI.FBretencion6);

        setRFE1(parametrosFromAPI.FEretencion1);
        setRFE2(parametrosFromAPI.FEretencion2);
        setRFE3(parametrosFromAPI.FEretencion3);
        setRFE4(parametrosFromAPI.FEretencion4);
        setRFE5(parametrosFromAPI.FEretencion5);
        setRFE6(parametrosFromAPI.FEretencion6);

        setRetencionMinima(parametrosFromAPI.Retencion_Minima);
        setRetencionMaxima(parametrosFromAPI.Retencion_Maxima);
    
        setRetencion_PN_Loc(parametrosFromAPI.Retencion_PN_Loc);
        setRetencion_PN_NPF(parametrosFromAPI.Retencion_PN_NPF);
        setRetencion_PN_PF(parametrosFromAPI.Retencion_PN_PF);
        setRetencion_PJ_Loc_Loc(parametrosFromAPI.Retencion_PJ_Loc_Loc);
        setRetencion_PJ_Loc_NPF(parametrosFromAPI.Retencion_PJ_Loc_NPF);
        setRetencion_PJ_Loc_PF(parametrosFromAPI.Retencion_PJ_Loc_PF);
        setRetencion_PJ_PF_Loc(parametrosFromAPI.Retencion_PJ_PF_Loc);
        setRetencion_PJ_PF_NPF(parametrosFromAPI.Retencion_PJ_PF_NPF);
        setRetencion_PJ_PF_PF(parametrosFromAPI.Retencion_PJ_PF_PF);
        setRetencion_PJ_NPF_Loc(parametrosFromAPI.Retencion_PJ_NPF_Loc);
        setRetencion_PJ_NPF_NPF(parametrosFromAPI.Retencion_PJ_NPF_NPF);
        setRetencion_PJ_NPF_PF(parametrosFromAPI.Retencion_PJ_NPF_PF);
      
    }

      async function fetchDividendos() {
        const apiData = await API.graphql({ query: listDividendos, variables: {  limit: 1000} });
        const dividendosFromAPI = apiData.data.listDividendos.items;
        setDividendos(dividendosFromAPI);
        setRows(dividendosFromAPI);          
      }

      async function fetchAccionistas(row) {

        ///////////////////////////

        var fechaSolicitada = row.fechaCorte.split("-").reverse().join("-");

        const fechaPasada = new Date(newFindClosest(fechas,fechaSolicitada)) ;

        if(fechaPasada.getHours() > 0) fechaPasada.setHours(fechaPasada.getHours() + 5);

        const MyDateString = fechaPasada.getFullYear()  + '-'
        + ('0' + (fechaPasada.getMonth()+1)).slice(-2) + '-'
        + ('0' + fechaPasada.getDate()).slice(-2);
      
        const filter = {
          fecha: {
            eq: MyDateString
          },            
          estado: {
            eq: "Activo"
            //ne: "Inactivo"
        }  
      }
        //console.log("FILTRO", filter, row.fechaCorte);
        const apiData3 = await API.graphql({query: listAccionistaArchives, variables: { filter: filter, limit: 20000} });
        let accionistasFromAPI3 = apiData3.data.listAccionistaArchives.items;

        let nexttoken4 = null
        if(apiData3.data.listAccionistaArchives.nextToken != null)
        {
        const apiData4 = await API.graphql({query: listAccionistaArchives, variables: { filter: filter, limit: 20000, nextToken: apiData3.data.listAccionistaArchives.nextToken} });
        const accionistasFromAPI4 = apiData4.data.listAccionistaArchives.items;
        accionistasFromAPI3 = accionistasFromAPI3.concat(accionistasFromAPI4);
        if(apiData4.data.listAccionistaArchives.nextToken != null) nexttoken4 = apiData4.data.listAccionistaArchives.nextToken
        }

        if(nexttoken4 != null)
        {
        const apiData5 = await API.graphql({query: listAccionistaArchives, variables: { filter: filter, limit: 20000, nextToken: nexttoken4} });
        const accionistasFromAPI5 = apiData5.data.listAccionistaArchives.items;
        accionistasFromAPI3 = accionistasFromAPI3.concat(accionistasFromAPI5);
        }


        let numero2 = 1;
        let nombre_aux2 = '';
        let cantidadTotal = 0;
        let cantidadSinMayoritario = 0;
        accionistasFromAPI3.forEach(function (obj) {        
          nombre_aux2 = obj.tipoPersona == 'PN' ? obj.pn_apellidoPaterno + " " + obj.pn_apellidoMaterno + " " + obj.pn_primerNombre + " " + obj.pn_segundoNombre : obj.nombre;
          obj.nombre2 = nombre_aux2.toUpperCase();
          cantidadTotal = cantidadTotal + obj.cantidadAcciones;
          obj.secuencial = numero2++;
          //cantidadSinMayoritario = obj.identificacion != '20563343193' ? cantidadSinMayoritario + obj.cantidadAcciones : cantidadSinMayoritario + 0;
        });
  
        setCantidadEmitido(cantidadTotal);
        
        //console.log("Canmtidad", cantidadSinMayoritario);

        const accionistasCalculo = accionistasFromAPI3.map(function(e) {
            return {
                id: e.id,
                idAccionista: e.idAccionista,
                tipoIdentificacion:  e.tipoIdentificacion,
                identificacion: e.identificacion,
                nombre: e.nombre2,
                direccionPais: e.direccionPais,
                paisNacionalidad: e.paisNacionalidad,
                cantidadAcciones: e.cantidadAcciones.toFixed(0),
                participacion: ((e.cantidadAcciones / cantidadTotal) * 100.00).toFixed(16),
                tipoAcciones: e.tipoAcciones,
                estado: e.estado,
                tipoPersona: e.tipoPersona,
                decevale: e.decevale,
                idDividendo: row.id,
                periodo: row.periodo,
                dividendo:  (row.dividendoRepartir * ((e.cantidadAcciones / cantidadTotal) * 100.00).toFixed(16) / 100.00).toFixed(2),
                baseImponible: (baseImponible * (row.dividendoRepartir * ((e.cantidadAcciones / cantidadTotal) * 100.00).toFixed(16) / 100.00).toFixed(2) / 100.00).toFixed(2),
                retencion: getRetencion1((baseImponible * (row.dividendoRepartir * ((e.cantidadAcciones / cantidadTotal) * 100.00).toFixed(16) / 100.00).toFixed(2) / 100.00).toFixed(2),e.tipoPersona, e.direccionPais, e.direccionPaisBeneficiario1 == null ? 'Ecuador' : e.direccionPaisBeneficiario1),
                dividendoRecibido: ((row.dividendoRepartir * ((e.cantidadAcciones / cantidadTotal) * 100.00).toFixed(16) / 100.00).toFixed(2) - getRetencion1((baseImponible * (row.dividendoRepartir * ((e.cantidadAcciones / cantidadTotal) * 100.00).toFixed(16) / 100.00).toFixed(2) / 100.00).toFixed(2),e.tipoPersona, e.direccionPais, e.direccionPaisBeneficiario1 == null ? 'Ecuador' : e.direccionPaisBeneficiario1)).toFixed(2),
                estadoDividendo: 'Confirmado',
                documento: '',
                solicitado: false,
                fechaSolicitud: '',
                HoraSolicitud: '',
                fechaPago: '',
                direccionPaisBeneficiario1: e.direccionPaisBeneficiario1,
                saldoDividendoPeriodo:  (row.saldoDividendo * ((e.cantidadAcciones / cantidadTotal) * 100.00).toFixed(16) / 100.00).toFixed(2),
            } ;
        })

///////////

const filter2 = {
  periodo: {
    eq: periodoSeleccionado.periodo
  },            
}
console.log("FILTRO", filter2);
const apiData10 = await API.graphql({query: listDividendosAccionistas, variables: { filter: filter2, limit: 20000} });
const accionistasFromAPI10 = apiData10.data.listDividendosAccionistas.items;

const sum = accionistasFromAPI10.reduce(function(prev, current) {
  return prev + +current.dividendo
}, 0);

const accionistasCalculo2 = accionistasCalculo.map(function(e) {
  return {
      id: e.id,
      idAccionista: e.idAccionista,
      tipoIdentificacion:  e.tipoIdentificacion,
      identificacion: e.identificacion,
      nombre: e.nombre,
      direccionPais: e.direccionPais,
      paisNacionalidad: e.paisNacionalidad,
      cantidadAcciones: e.cantidadAcciones,
      participacion: e.participacion,
      tipoAcciones: e.tipoAcciones,
      estado: e.estado,
      tipoPersona: e.tipoPersona,
      decevale: e.decevale,
      idDividendo: e.id,
      periodo: e.periodo,
      dividendo:  (row.dividendoRepartir * ((e.cantidadAcciones / cantidadTotal) * 100.00).toFixed(16) / 100.00).toFixed(2),
      //dividendo: e.porcentajeRepartir < 50 && periodoSeleccionado.saldoPorcentajeDividendo < 50 ? 0 : e.porcentajeRepartir < 50 ? e.dividendo :  
      //(((100 - periodoSeleccionado.saldoPorcentajeDividendo)/100.00) * periodoSeleccionado.dividendo)*((e.cantidadAcciones / cantidadTotal) * 100.00) -  ((periodoSeleccionado.dividendo * ((e.cantidadAcciones / cantidadTotal) * 100.00).toFixed(16) / 100.00)/50.00).toFixed(2),

      
      baseImponible: (baseImponible * (row.dividendoRepartir * ((e.cantidadAcciones / cantidadTotal) * 100.00).toFixed(16) / 100.00).toFixed(2) / 100.00).toFixed(2),
      retencion: getRetencion1((baseImponible * (row.dividendoRepartir * ((e.cantidadAcciones / cantidadTotal) * 100.00).toFixed(16) / 100.00).toFixed(2) / 100.00).toFixed(2),e.tipoPersona, e.direccionPais, e.direccionPaisBeneficiario1 == null ? 'Ecuador' : e.direccionPaisBeneficiario1),
      dividendoRecibido: ((row.dividendoRepartir * ((e.cantidadAcciones / cantidadTotal) * 100.00).toFixed(16) / 100.00).toFixed(2) - getRetencion1((baseImponible * (row.dividendoRepartir * ((e.cantidadAcciones / cantidadTotal) * 100.00).toFixed(16) / 100.00).toFixed(2) / 100.00).toFixed(2),e.tipoPersona, e.direccionPais, e.direccionPaisBeneficiario1 == null ? 'Ecuador' : e.direccionPaisBeneficiario1)).toFixed(2),
      estadoDividendo: 'Confirmado',
      documento: '',
      solicitado: true,
      fechaSolicitud: '',
      HoraSolicitud: '',
      fechaPago: '',
      direccionPaisBeneficiario1: e.direccionPaisBeneficiario1,
      saldoDividendoPeriodo:  (row.saldoDividendo * ((e.cantidadAcciones / cantidadTotal) * 100.00).toFixed(16) / 100.00).toFixed(2),
  } ;
})


////////////


        setAccionistasCorte(accionistasCalculo);
        setOpenAccionistas(true)
      }

/////////////////////////

async function fetchAccionistasDividendos(row) {

  const filter = {
    idDividendo: {
      eq: row.id
    },            
  }
  console.log("FILTRO", filter);
  const apiData3 = await API.graphql({query: listDividendosAccionistas, variables: { filter: filter, limit: 20000} });
  let accionistasFromAPI3 = apiData3.data.listDividendosAccionistas.items;

  let nexttoken4 = null
  if(apiData3.data.listDividendosAccionistas.nextToken != null)
  {
  const apiData4 = await API.graphql({query: listDividendosAccionistas, variables: { filter: filter, limit: 20000, nextToken: apiData3.data.listDividendosAccionistas.nextToken} });
  const accionistasFromAPI4 = apiData4.data.listDividendosAccionistas.items;
  accionistasFromAPI3 = accionistasFromAPI3.concat(accionistasFromAPI4);
  if(apiData4.data.listDividendosAccionistas.nextToken != null) nexttoken4 = apiData4.data.listDividendosAccionistas.nextToken
  }

  if(nexttoken4 != null)
  {
  const apiData5 = await API.graphql({query: listDividendosAccionistas, variables: { filter: filter, limit: 20000, nextToken: nexttoken4} });
  const accionistasFromAPI5 = apiData5.data.listDividendosAccionistas.items;
  accionistasFromAPI3 = accionistasFromAPI3.concat(accionistasFromAPI5);
  }

  setAccionistasCorteDividendos(accionistasFromAPI3);
  setOpenAccionistasDividendos(true)
}


async function fetchAccionista50(row) {

  const div50 = ((periodoSeleccionado.dividendo * row.participacion / 100.00)/2.00).toFixed(2);
  console.log("div50",div50)

  const operID  = await API.graphql({ query: updateDividendosAccionista, variables: { input: {id: row.id,  solicitado : true, dividendo : div50, dividendoRecibido : div50 } } });

  fetchAccionistasDividendos(periodoSeleccionado);
  //setAccionistasCorteDividendos(accionistasFromAPI3);
  //setOpenAccionistasDividendos(true)


}



const [fechas, setFechas] = useState([]);

async function fetchOperaciones() {

  //console.log('entro de nuevo ??', 'SIIII')

  let arrayFechas = []

  let filter = {
    estado: {
        eq: 'Aprobada' // filter priority = 1
    },
    
};

  const apiData = await API.graphql({ query: listOperaciones , variables: { filter: filter , limit: 10000},  });
  const operacionesFromAPI = apiData.data.listOperaciones.items;


  operacionesFromAPI.sort(function (b, a) {
    if (new Date(+a.fecha.split("-")[2],a.fecha.split("-")[1] - 1, +a.fecha.split("-")[0]) > new Date(+b.fecha.split("-")[2],b.fecha.split("-")[1] - 1, +b.fecha.split("-")[0])) return 1;
    if (new Date(+a.fecha.split("-")[2],a.fecha.split("-")[1] - 1, +a.fecha.split("-")[0]) < new Date(+b.fecha.split("-")[2],b.fecha.split("-")[1] - 1, +b.fecha.split("-")[0])) return -1;
    return 0;
  });
  

  operacionesFromAPI.forEach(function (obj) {
      
    //obj.nombre2 = obj.tipoPersona == 'PN' ? obj.pn_primerNombre + " " + obj.pn_segundoNombre + " " + obj.pn_apellidoPaterno + " " + obj.pn_apellidoMaterno : obj.nombre;
    //nombre_aux = obj.tipoPersona == 'PN' ? obj.pn_apellidoPaterno + " " + obj.pn_apellidoMaterno + " " + obj.pn_primerNombre + " " + obj.pn_segundoNombre : obj.nombre;
    obj.cedente = obj.cedente.toUpperCase();
    obj.cesionario = obj.cesionario.toUpperCase();

    //var newdate = date.split("-").reverse().join("-");

    arrayFechas.push(obj.fecha.split("-").reverse().join("-"));

  });

  setFechas(arrayFechas);
  console.log("Set de Fechas", arrayFechas)

}

function newFindClosest(dates, testDate) {
  var before = [];
  var after = [];
  var max = dates.length;
  for(var i = 0; i < max; i++) {
      var tar = dates[i];
      
      //var arrDate = new Date(tar.day_year, tar.day_month, tar.day_number);
      var arrDate = new Date(tar);

      var fechaConsultada = new Date(testDate);
      //console.log('resultado antes 1',testDate);
      //console.log('resultado antes 2',fechaConsultada);
      var fechaConsultada2 = fechaConsultada.setHours(fechaConsultada.getHours() + 5);
      
      if(arrDate.getHours() > 0) arrDate.setHours(arrDate.getHours() + 5);
      //console.log('resultado despues',fechaConsultada,arrDate,(arrDate - fechaConsultada2) );
      //var fechaConsultada2 = removeTime(fechaConsultada);
      //var fechaConsultada2 = new Date(fechaConsultada.getFullYear(), fechaConsultada.getMonth(), fechaConsultada.getDate());
      
      //var fechaConsultada = new Date(Date.UTC(testDate.getFullYear(), testDate.getMonth(), testDate.getDate()));
      // 3600 * 24 * 1000 = calculating milliseconds to days, for clarity.
      //var diff = (arrDate - new Date(testDate)) / (3600 * 24 * 1000);
      var diff = (arrDate - fechaConsultada2) ;

      //console.log('resultado',fechaConsultada,tar,fechaConsultada.setHours(fechaConsultada.getHours() + 5),arrDate)
      if(diff > 0) {
          before.push({diff: diff, index: i,fecha: arrDate});
      } else {
          after.push({diff: diff, index: i, fecha: arrDate});
      }
  }
  before.sort(function(a, b) {
      if(a.diff < b.diff) {
          return -1;
      }
      if(a.diff > b.diff) {
          return 1;
      }
      return 0;
  });

  after.sort(function(a, b) {
      if(a.diff > b.diff) {
          return -1;
      }
      if(a.diff < b.diff) {
          return 1;
      }
      return 0;
  });

  //console.log('AFTER',after);

  const closest = Math.min(...after.map(o => o.index));

  return dates[closest];
  //return {Math.max.apply(Math, after.map(function(o) { return o.index; }))};
  //return {after.reduce((prev, current) => (prev.y > current.y) ? prev : current)};
  //return {datesBefore: before, datesAfter: after};
}



/////////////////////////

/*
      async function refrescarAccionistas() {

        let filter = {
            estado: {
                ne: "Inactivo" // filter priority = 1
            },
          };
    
        const apiData = await API.graphql({ query: listAccionistas, variables: { filter: filter, limit : 1000} });
        const accionistasFromAPI = apiData.data.listAccionistas.items;       

        console.log("PERIODO SELECCIONADO",periodoSeleccionado.dividendoRepartir);

        const accionistasCalculo = accionistasFromAPI.map(function(e) {
            return {
                id: e.id,
                idAccionista: e.idAccionista,
                tipoIdentificacion:  e.tipoIdentificacion,
                identificacion: e.identificacion,
                nombre: e.nombre,
                direccionPais: e.direccionPais,
                paisNacionalidad: e.paisNacionalidad,
                cantidadAcciones: e.cantidadAcciones.toFixed(0),
                participacion: getParticipacion1(e.cantidadAcciones),
                tipoAcciones: e.tipoAcciones,
                estado: e.estado,
                tipoPersona: e.tipoPersona,
                decevale: e.decevale,
                idDividendo: periodoSeleccionado.id,
                periodo: periodoSeleccionado.periodo,
                dividendo:  (periodoSeleccionado.dividendoRepartir * getParticipacion1(e.cantidadAcciones) / 100.00).toFixed(2),
                baseImponible: (baseImponible * (periodoSeleccionado.dividendoRepartir * getParticipacion1(e.cantidadAcciones) / 100.00).toFixed(2) / 100.00).toFixed(2),
                retencion: getRetencion1((baseImponible * (periodoSeleccionado.dividendoRepartir * getParticipacion1(e.cantidadAcciones) / 100.00).toFixed(2) / 100.00).toFixed(2),e.direccionPais),
                dividendoRecibido: ((periodoSeleccionado.dividendoRepartir * getParticipacion1(e.cantidadAcciones) / 100.00).toFixed(2) - getRetencion1((baseImponible * (periodoSeleccionado.dividendoRepartir * getParticipacion1(e.cantidadAcciones) / 100.00).toFixed(2) / 100.00).toFixed(2),e.direccionPais)).toFixed(2),
                estadoDividendo: 'Confirmado',
                documento: '',
                solicitado: false,
                fechaSolicitud: '',
                HoraSolicitud: '',
                fechaPago: '',
            } ;
        })

        //console.log("PRUEBAAAAAA",accionistasCalculo);
        setAccionistasCorte(accionistasCalculo);
        }
      */
/*
        function getSaldoPeriodo(periodo) {

          total = dividendos.reduce(function(e) {   return e.     })
  
          const sum = dividendos.reduce(function(prev, current) {
            return prev + +current.acciones
          }, 0);
  
          return ((cantidadAcciones / cantidadEmitido) * 100.00).toFixed(16) ;
      }
  */

    const handlePeriodoChange = (event) => {
      console.log("texto",event.target);

      //pais.find(o => o.value === data.paisDireccion).label

      setFormData({ ...formData, 'periodo': event.target.value})};

      const handleConceptoChange = (event) => {
        setFormData({ ...formData, 'concepto': event.target.value})};

    const handleDividendoChange = (event) => {

        const divRepartidos = dividendos.reduce(function(prev, current) {
          return prev + +(current.periodo == formData.periodo ?current.dividendoRepartir:0)
        }, 0);

        const divSaldoPorc = dividendos.reduce(function(prev, current) {
          return prev + +(current.periodo == formData.periodo ?current.saldoPorcentajeDividendo:0)
        }, 0);

        console.log("Dividendos Saldo", divRepartidos);
        console.log("Porcentaje Saldo", divSaldoPorc);
        //setFormData({ ...formData, 'dividendo': event.target.value, 'dividendoRepartir': (event.target.value * formData.porcentajeRepartir /100.00).toFixed(2), 'saldoDividendo': ((event.target.value*(100.00-formData.porcentajeRepartir)/100.00) - divRepartidos).toFixed(2), 'saldoPorcentajeDividendo': divSaldoPorc > 0 ? divSaldoPorc - formData.porcentajeRepartir : 100.00 - formData.porcentajeRepartir})};
        setFormData({ ...formData, 'dividendo': event.target.value, 'dividendoRepartir': (event.target.value * formData.porcentajeRepartir /100.00).toFixed(2), 'saldoDividendo': (event.target.value - (event.target.value * formData.porcentajeRepartir /100.00).toFixed(2)).toFixed(2) , 'saldoPorcentajeDividendo':  100.00 - formData.porcentajeRepartir})};        

    const handlePorcentajeRepartirChange = (event) => {
      
        const divRepartidos = dividendos.reduce(function(prev, current) {
          return prev + +(current.periodo == formData.periodo ?current.dividendoRepartir:0)
        }, 0);

        const divSaldoPorc = dividendos.reduce(function(prev, current) {
          return prev + +(current.periodo == formData.periodo ?current.saldoPorcentajeDividendo:0)
        }, 0);
        console.log("Dividendos Saldo", divRepartidos);
        console.log("Porcentaje Saldo", divSaldoPorc);
        console.log("Porcentaje Saldo 2", divSaldoPorc - event.target.value);
        //setFormData({ ...formData, 'porcentajeRepartir': event.target.value, 'dividendoRepartir': (event.target.value * formData.dividendo /100.00).toFixed(2), 'saldoDividendo': ((formData.dividendo*(100.00-event.target.value)/100.00) - divRepartidos).toFixed(2), 'saldoPorcentajeDividendo': divSaldoPorc > 0 ? divSaldoPorc - event.target.value : 100.00 - event.target.value})        
        setFormData({ ...formData, 'porcentajeRepartir': event.target.value, 'dividendoRepartir': (event.target.value * formData.dividendo /100.00).toFixed(2), 'saldoDividendo': (formData.dividendo - (event.target.value * formData.dividendo /100.00).toFixed(2)).toFixed(2), 'saldoPorcentajeDividendo': 100.00 - event.target.value})                
    };
    
    const handleChangeFechaCorte = (event) => {
        setFormData({ ...formData, 'fechaCorte': event.target.value.split(" ")[0].split("-").reverse().join("-") })
    };
    const handleChangeFechaPago = (event) => {
        setFormData({ ...formData, 'fechaPago': event.target.value.split(" ")[0].split("-").reverse().join("-") })
    };

    const handleChangeSecuencial = (event) => {
      setFormData({ ...formData, 'secuencial': event.target.value })
  };


    const [formData, setFormData] = useState({
            periodo:  '',
            secuencial: '',
            concepto: '',            
            dividendo: 0,
            porcentajeRepartir: 0,
            dividendoRepartir: 0,
            fechaCorte: '',
            fechaPago: '',
            estado: 'Nuevo',
            retencion: 0,
            idDividendoOrigen:  '',
            saldoDividendo: 0,
            saldoPorcentajeDividendo: 0,
            entregado: 0,
            porEntregar: 0,
    });

      const addDividendo = async () => {
        try {
            
            if (!formData.periodo || !formData.dividendo || !formData.porcentajeRepartir || !formData.fechaCorte || !formData.fechaPago) return
    
            setCircular(true);
    
            const dividendo = { ...formData }
    
            setFormData({
                periodo:  '',
                secuencial:  '',
                concepto:  '',               
                dividendo: 0,
                porcentajeRepartir: 0,
                dividendoRepartir: 0,
                fechaCorte: '',
                fechaPago: '',
                estado: 'Nuevo',
                retencion: 0,
                idDividendoOrigen:  '',
                saldoDividendo: 0,
                saldoPorcentajeDividendo: 0,
                entregado: 0,
                porEntregar: 0,
            });
    
    
            const dividendoID = await API.graphql(graphqlOperation(createDividendos, { input: dividendo }))
        
            setCircular(false);

            handleCloseCrearDividendo();

            setRefrescar(!refrescar);

    
             } catch (err) {
            console.log('error creating transaction:', err)
        }   
      }

      

      const handleCloseSnack = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setOpenSnack(false);
      };


      function LinearProgressWithLabel(props) {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress variant="determinate" {...props} />
            </Box>
            <Box sx={{ minWidth: 35 }}>
              <Typography variant="body2" color="text.secondary">{`${Math.round(
                props.value,
              )}%`}</Typography>
            </Box>
          </Box>
        );
      }

      LinearProgressWithLabel.propTypes = {
        /**
         * The value of the progress indicator for the determinate and buffer variants.
         * Value between 0 and 100.
         */
        value: PropTypes.number.isRequired,
      };
      
    const [rowSelectionModel, setRowSelectionModel] = React.useState([]);

    const classes = useStyles();

    return (

        <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <div>
            <Button                
                variant="contained"
                color="primary"
                className={classes.button}
                size='small'
                onClick={ handleOpenCrearDividendo }
                style={{textTransform: 'none'}}
            >
                +  Nuevo Dividendo
            </Button>                
            </div>

            <DataGrid
              style={{backgroundColor:'white'}}
              density="compact"             
              autoHeight='true'
              autoPageSize='true'
              disableColumnMenu 
              rows={rows}
              columns={columns}              
              pageSize={20}
              rowsPerPageOptions={[20]}
            />
          </Grid>
  
  
          <Dialog open={openAccionistas} onClose={handleClose} aria-labelledby="form-dialog-title"  fullScreen  >          
            <DialogTitle id="form-dialog-title">
              <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-around', width:'100%' }}>              
              {periodoSeleccionado.concepto} : {periodoSeleccionado.periodo} : {periodoSeleccionado.secuencial}
              <Typography variant="body2" >Total dividendo del periodo : {new Intl.NumberFormat('en-US',{minimumFractionDigits: 2,maximumFractionDigits: 2,}).format(periodoSeleccionado.dividendo)}</Typography>
              <Typography variant="body2" >Total a repartir : {new Intl.NumberFormat('en-US',{minimumFractionDigits: 2,maximumFractionDigits: 2,}).format(periodoSeleccionado.dividendoRepartir) }</Typography>
              <Typography variant="body2" >Porcentaje a repartir : {new Intl.NumberFormat('en-US',{minimumFractionDigits: 2,maximumFractionDigits: 2,}).format(periodoSeleccionado.porcentajeRepartir)} %</Typography>
              <Typography variant="body2" >Saldo : {new Intl.NumberFormat('en-US',{minimumFractionDigits: 2,maximumFractionDigits: 2,}).format(periodoSeleccionado.saldoDividendo)}</Typography>
              </div>
            </DialogTitle>
            
            <DialogContent style={{height: '500px'}}>
  
                <DataGrid
                style={{backgroundColor:'white'}}
                density="compact"             
                autoHeight='true'
                maxWidth='true'
                autoPageSize='true'
                disableColumnMenu 
                rows={accionistasCorte}
                columns={columnsAccionistasCorte}
                //components={{ Toolbar: GridToolbar }}
                pageSize={100}
                rowsPerPageOptions={[100]}
                />



            </DialogContent>
            <DialogActions style={{display:'flex', flexDirection:'row', alignItems:'flex-end', justifyContent:'flex-end', width:'100%' }}>            
                        

             <Button onClick={handleConfirmarDividendo} variant="contained" color="primary" style={{textTransform: 'none'}}>
                Confirmar
              </Button>

              <Button onClick={handleClose} color="primary" >
                Salir
              </Button>
            </DialogActions>
          </Dialog>
  
  
          <Dialog open={openAccionistasDividendos} onClose={handleCloseAccionistasDividendos} aria-labelledby="form-dialog-title"  fullScreen  >          
            <DialogTitle id="form-dialog-title">
              <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-around', width:'100%' }}>              
              Ejercicio {periodoSeleccionado.periodo}
              <Typography variant="body2" >Total dividendo del periodo : {new Intl.NumberFormat('en-US',{minimumFractionDigits: 2,maximumFractionDigits: 2,}).format(periodoSeleccionado.dividendo)}</Typography>
              <Typography variant="body2" >Total a repartir : {new Intl.NumberFormat('en-US',{minimumFractionDigits: 2,maximumFractionDigits: 2,}).format(periodoSeleccionado.dividendoRepartir) }</Typography>
              <Typography variant="body2" >Porcentaje a repartir : {new Intl.NumberFormat('en-US',{minimumFractionDigits: 2,maximumFractionDigits: 2,}).format(periodoSeleccionado.porcentajeRepartir)} %</Typography>
              <Typography variant="body2" >Saldo del periodo : {new Intl.NumberFormat('en-US',{minimumFractionDigits: 2,maximumFractionDigits: 2,}).format(periodoSeleccionado.saldoDividendo)}</Typography>
              </div>
            </DialogTitle>
            
            <DialogContent style={{height: '500px'}}>
  
                <DataGrid
                style={{backgroundColor:'white'}}
                density="compact"             
                autoHeight='true'
                maxWidth='true'
                autoPageSize='true'
                disableColumnMenu 
                rows={accionistasCorteDividendos}
                columns={columnsAccionistasCorteDividendos}
                //components={{ Toolbar: GridToolbar }}
                pageSize={100}
                rowsPerPageOptions={[100]}
                />



            </DialogContent>
            <DialogActions style={{display:'flex', flexDirection:'row', alignItems:'flex-end', justifyContent:'flex-end', width:'100%' }}>            
                        

              <Button onClick={handleCloseAccionistasDividendos} color="primary" >
                Salir
              </Button>
            </DialogActions>
          </Dialog>
  

          <Dialog open={openCrearDividendo} onClose={handleCloseCrearDividendo} aria-labelledby="form-dialog-title"  maxWidth = 'lg'  >          
            <DialogTitle id="form-dialog-title">Crear nuevo dividendo</DialogTitle>
            <DialogContent style={{height: '450px', width:'300px' }}>
  
            <div style={{display:'flex', flexDirection:'row', alignItems: 'flex-start', justifyContent:'space-between', width:'100%', }}>
            
                <div style={{display:'flex', flexDirection:'column', alignItems: 'flex-start', justifyContent:'space-between', width:'90%', }}>

                  <div style={{display:'flex', flexDirection:'row', alignItems: 'flex-start', justifyContent:'space-evenly', width:'100%', }}>
                    <FormControl style={{width:'180px'}}>
                        <InputLabel id="periodo-select-label">Periodo</InputLabel>
                        <Select
                        labelId="periodo-select-label"
                        id="select-periodo"
                        value={formData.periodo}
                        label="Retención Asignada"
                        onChange={handlePeriodoChange}
                        >
                        <MenuItem value={2015} >2015</MenuItem>
                        <MenuItem value={2016} >2016</MenuItem>
                        <MenuItem value={2017} >2017</MenuItem>
                        <MenuItem value={2018} >2018</MenuItem>
                        <MenuItem value={2019} >2019</MenuItem>
                        <MenuItem value={2020} >2020</MenuItem>
                        <MenuItem value={2021} >2021</MenuItem>
                        <MenuItem value={2022} >2022</MenuItem>
                        <MenuItem value={2023} >2023</MenuItem>
                        <MenuItem value={2024} >2024</MenuItem>
                        <MenuItem value={2025} >2025</MenuItem>
                        <MenuItem value={2026} >2026</MenuItem>
                        <MenuItem value={2027} >2027</MenuItem>
                        <MenuItem value={2028} >2028</MenuItem>
                        <MenuItem value={2029} >2029</MenuItem>
                        <MenuItem value={2030} >2030</MenuItem>
                        <MenuItem value={2031} >2031</MenuItem>
                        <MenuItem value={2032} >2032</MenuItem>
                        <MenuItem value={2033} >2033</MenuItem>
                        <MenuItem value={2034} >2034</MenuItem>                        
                        </Select>
                    </FormControl>

                    <TextField style={{marginLeft:'10px'}}
                        id="outlined-required"
                        label="Secuencial"
                        value={formData.secuencial}
                        onChange={handleChangeSecuencial}
                        fullWidth
                    /> 
                  </div>

                    <FormControl style={{width:'100%'}}>
                        <InputLabel id="concepto-select-label">Concepto</InputLabel>
                        <Select
                        labelId="concepto-select-label"
                        id="select-concepto"
                        value={formData.concepto}
                        label="Concepto"
                        onChange={handleConceptoChange}
                        >
                        <MenuItem value={'Resultado'} >Resultado</MenuItem>
                        <MenuItem value={'Resultado VPP'} >Resultado VPP</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        id="outlined-required"
                        label="Dividendo"
                        value={formData.dividendo}
                        type='number'
                        onChange={handleDividendoChange}
                        fullWidth
                    /> 

                    <TextField
                        id="outlined-required"
                        label="% a repartir"
                        value={formData.porcentajeRepartir}
                        type='number'
                        onChange={handlePorcentajeRepartirChange}
                        fullWidth
                    /> 

                    <TextField
                        id="outlined-required"
                        label="Dividendo a Repartir"
                        value={formData.dividendoRepartir}                                
                        fullWidth
                        disabled
                        type='number'
                    /> 

                    <FormControl fullWidth style={{paddingTop:10}}>
                        <TextField
                            size='small'
                            id="datetime-local"
                            label="Fecha Corte"
                            type="date"
                            defaultValue={Date.now()}
                            variant="standard"
                            InputLabelProps={{
                                shrink: true,
                            }}     
                            value={formData.fechaCorte.split(" ")[0].split("-").reverse().join("-")}
                            onChange={handleChangeFechaCorte}     
                            fullWidth='false'          
                        />
                    </FormControl>
                    <FormControl fullWidth style={{paddingTop:10, marginBottom:20}}>
                        <TextField
                            size='small'
                            id="datetime-local-2"
                            label="Fecha Junta"
                            type="date"
                            defaultValue={Date.now()}
                            variant="standard"
                            InputLabelProps={{
                                shrink: true,
                            }}    
                            value={formData.fechaPago.split(" ")[0].split("-").reverse().join("-")}
                            onChange={handleChangeFechaPago}                      
                        />
                    </FormControl>

                    Saldo del periodo {formData.saldoDividendo}
                </div>

            </div>

  
            </DialogContent>
            <DialogActions>
            <Button                
                variant="contained"
                color="primary"
                className={classes.button}
                size='small'
                onClick={ addDividendo }
                style={{textTransform: 'none'}}
            >
                Crear Dividendo
            </Button>   
              <Button onClick={handleCloseCrearDividendo} color="secondary" style={{textTransform: 'none'}}>
                Salir
              </Button>
            </DialogActions>
          </Dialog>

          {circular && <CircularProgress />}
        <Snackbar open={openSnack} autoHideDuration={6000} onClose={handleCloseSnack}>
            <Alert onClose={handleCloseSnack} severity="success">
            Se registró correctamente el dividendo.
        </Alert>
      </Snackbar>
           
        </Grid>
      </main>
  


    );
}