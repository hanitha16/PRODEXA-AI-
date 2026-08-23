// ============================================================
// PRODEXA AI — 15 Industrial Products Test Catalog
// ============================================================

export const PRODEXA_TEST_CATALOG_CSV = `product_code,manufacturer_name,product_description,voltage,pressure_range,material,output_or_actuation,flow_or_current,additional_specs
PS-100,Acme Industrial,Pressure sensor 0-10 bar piezoresistive,24V,0-10bar,SS,4-20mA,,G1/2 thread
CB-220,Schneider Tech,Circuit Breaker 3-Pole 32A 10kA,220V,,Cast Iron,,32A,10kA 3P DIN-rail
PLC-1214,Siemens Automation,SIMATIC S7-1200 Digital Input Module 14 I/O,24VDC,,,Modbus/Ethernet,14 I/O,IP20 DIN Mount
PS-100,Acme Ind,PS 100 Pressure Sensor 0-10 bar variant,24V,0-10bar,SS316,4-20mA,,G1/2 BSP
MTR-750,ABB Motors,Three-Phase Induction Motor 7.5kW 1450RPM,400V,,Cast Iron,,7.5kW,1450rpm IE3 3PH
VAL-200,FlowServe,2-Way High Pressure Hydraulic Control Valve 350 bar,24VDC,350bar,Brass,Solenoid,,G1/2 inch
TS-50,Endress+Hauser,RTD Pt100 Industrial Temperature Sensor -50 to 200C,24V,,SS316L,4-20mA,,-50..200C
PMP-300,Grundfos,Industrial Centrifugal Water Pump 300L/min 12 bar,230/400V,12bar,SS,,300L/min,Flange DN50
FLT-10,Parker Hannifin,High-Efficiency Hydraulic Line Filter 10 micron,24V,210bar,Alu,,120L/min,10um rating
CB-221,Schneider Tech,Miniature Circuit Breaker 1-Pole 16A 6kA,230V,,,,16A,6kA 1P DIN-rail
MTR-110,Siemens,Three-Phase Induction Motor 1.1kW IE2,230/400V,,Aluminium,,1.1kW,2850rpm IE2 3PH
PS-210,WIKA,Heavy Duty Industrial Pressure Transmitter 0-250 bar,24V,0-250bar,SS316,0-10V,,Accuracy 0.25%
VAL-310,Emerson,Pneumatic Control Butterfly Valve DN50,24VDC,16bar,Ductile Iron,Pneumatic,,DN50 Flange
PLC-220,Rockwell Allen-Bradley,CompactLogix Digital Output Module 16pt,24VDC,,,EtherNet/IP,16 DO,IP20
PMP-500,KSB,Heavy Duty Submersible Slurry Pump 500L/min 8 bar,400V,8bar,Duplex SS,,500L/min,8 bar max
`;

export interface TestCatalogItem {
  product_code: string;
  manufacturer_name: string;
  product_description: string;
  voltage: string;
  pressure_range: string;
  material: string;
  output_or_actuation: string;
  flow_or_current: string;
  additional_specs: string;
}

export const TEST_CATALOG_ITEMS: TestCatalogItem[] = [
  {
    product_code: "PS-100",
    manufacturer_name: "Acme Industrial",
    product_description: "Pressure sensor 0-10 bar piezoresistive",
    voltage: "24V",
    pressure_range: "0-10bar",
    material: "SS",
    output_or_actuation: "4-20mA",
    flow_or_current: "",
    additional_specs: "G1/2 thread",
  },
  {
    product_code: "CB-220",
    manufacturer_name: "Schneider Tech",
    product_description: "Circuit Breaker 3-Pole 32A 10kA",
    voltage: "220V",
    pressure_range: "",
    material: "Cast Iron",
    output_or_actuation: "",
    flow_or_current: "32A",
    additional_specs: "10kA 3P DIN-rail",
  },
  {
    product_code: "PLC-1214",
    manufacturer_name: "Siemens Automation",
    product_description: "SIMATIC S7-1200 Digital Input Module 14 I/O",
    voltage: "24VDC",
    pressure_range: "",
    material: "",
    output_or_actuation: "Modbus/Ethernet",
    flow_or_current: "14 I/O",
    additional_specs: "IP20 DIN Mount",
  },
  {
    product_code: "PS-100",
    manufacturer_name: "Acme Ind",
    product_description: "PS 100 Pressure Sensor 0-10 bar variant",
    voltage: "24V",
    pressure_range: "0-10bar",
    material: "SS316",
    output_or_actuation: "4-20mA",
    flow_or_current: "",
    additional_specs: "G1/2 BSP",
  },
  {
    product_code: "MTR-750",
    manufacturer_name: "ABB Motors",
    product_description: "Three-Phase Induction Motor 7.5kW 1450RPM",
    voltage: "400V",
    pressure_range: "",
    material: "Cast Iron",
    output_or_actuation: "",
    flow_or_current: "7.5kW",
    additional_specs: "1450rpm IE3 3PH",
  },
  {
    product_code: "VAL-200",
    manufacturer_name: "FlowServe",
    product_description: "2-Way High Pressure Hydraulic Control Valve 350 bar",
    voltage: "24VDC",
    pressure_range: "350bar",
    material: "Brass",
    output_or_actuation: "Solenoid",
    flow_or_current: "",
    additional_specs: "G1/2 inch",
  },
  {
    product_code: "TS-50",
    manufacturer_name: "Endress+Hauser",
    product_description: "RTD Pt100 Industrial Temperature Sensor -50 to 200C",
    voltage: "24V",
    pressure_range: "",
    material: "SS316L",
    output_or_actuation: "4-20mA",
    flow_or_current: "",
    additional_specs: "-50..200C",
  },
  {
    product_code: "PMP-300",
    manufacturer_name: "Grundfos",
    product_description: "Industrial Centrifugal Water Pump 300L/min 12 bar",
    voltage: "230/400V",
    pressure_range: "12bar",
    material: "SS",
    output_or_actuation: "",
    flow_or_current: "300L/min",
    additional_specs: "Flange DN50",
  },
  {
    product_code: "FLT-10",
    manufacturer_name: "Parker Hannifin",
    product_description: "High-Efficiency Hydraulic Line Filter 10 micron",
    voltage: "24V",
    pressure_range: "210bar",
    material: "Alu",
    output_or_actuation: "",
    flow_or_current: "120L/min",
    additional_specs: "10um rating",
  },
  {
    product_code: "CB-221",
    manufacturer_name: "Schneider Tech",
    product_description: "Miniature Circuit Breaker 1-Pole 16A 6kA",
    voltage: "230V",
    pressure_range: "",
    material: "",
    output_or_actuation: "",
    flow_or_current: "16A",
    additional_specs: "6kA 1P DIN-rail",
  },
  {
    product_code: "MTR-110",
    manufacturer_name: "Siemens",
    product_description: "Three-Phase Induction Motor 1.1kW IE2",
    voltage: "230/400V",
    pressure_range: "",
    material: "Aluminium",
    output_or_actuation: "",
    flow_or_current: "1.1kW",
    additional_specs: "2850rpm IE2 3PH",
  },
  {
    product_code: "PS-210",
    manufacturer_name: "WIKA",
    product_description: "Heavy Duty Industrial Pressure Transmitter 0-250 bar",
    voltage: "24V",
    pressure_range: "0-250bar",
    material: "SS316",
    output_or_actuation: "0-10V",
    flow_or_current: "",
    additional_specs: "Accuracy 0.25%",
  },
  {
    product_code: "VAL-310",
    manufacturer_name: "Emerson",
    product_description: "Pneumatic Control Butterfly Valve DN50",
    voltage: "24VDC",
    pressure_range: "16bar",
    material: "Ductile Iron",
    output_or_actuation: "Pneumatic",
    flow_or_current: "",
    additional_specs: "DN50 Flange",
  },
  {
    product_code: "PLC-220",
    manufacturer_name: "Rockwell Allen-Bradley",
    product_description: "CompactLogix Digital Output Module 16pt",
    voltage: "24VDC",
    pressure_range: "",
    material: "",
    output_or_actuation: "EtherNet/IP",
    flow_or_current: "16 DO",
    additional_specs: "IP20",
  },
  {
    product_code: "PMP-500",
    manufacturer_name: "KSB",
    product_description: "Heavy Duty Submersible Slurry Pump 500L/min 8 bar",
    voltage: "400V",
    pressure_range: "8bar",
    material: "Duplex SS",
    output_or_actuation: "",
    flow_or_current: "500L/min",
    additional_specs: "8 bar max",
  },
];
