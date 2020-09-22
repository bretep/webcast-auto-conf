#pin select  VI_ADC_CLK  
himm 0x200f0000 0x00000001 #GPIO8_5/VI_ADC_CLK/CLK_TEST_OUT0/CLK_TEST_OUT0/CLK_TEST_OUT1/CLK_TEST_OUT2/CLK_TEST_OUT3/RTC_TEST_CLK  //muxctrl_reg0

#pin select  VIU0
himm 0x200f0004 0x00000000 #VIU0_CLK  / GPIO8_6  / fephy_dbg_adccki / VIU0_DAT0 //muxctrl_reg1
############################VIU0_DAT0 / GPIO3_0  / fephy_dbg_out0   / VIU0_DAT1 
############################VIU0_DAT1 / GPIO3_1  / fephy_dbg_out1   / VIU0_DAT2 
############################VIU0_DAT2 / GPIO3_2  / fephy_dbg_out2   / VIU0_DAT3 
############################VIU0_DAT3 / GPIO3_3  / fephy_dbg_out3   / VIU0_DAT4 
############################VIU0_DAT4 / GPIO3_4  / fephy_dbg_out4   / VIU0_DAT5 
############################VIU0_DAT5 / GPIO3_5  / fephy_dbg_out5   / VIU0_DAT6 
############################VIU0_DAT6 / GPIO3_6  / fephy_dbg_out6   / VIU0_DAT7 
############################VIU0_DAT7 / GPIO3_7  / fephy_dbg_out7   / VIU0_CLK  

#VIU1 
himm 0x200f0008 0x00000000 #VIU1_CLK  / GPIO8_7  /  ************    / VIU1_DAT0 //muxctrl_reg2
############################VIU1_DAT0 / GPIO4_0  / fephy_dbg_out8   / VIU1_DAT1 
############################VIU1_DAT1 / GPIO4_1  / fephy_dbg_out9   / VIU1_DAT2 
############################VIU1_DAT2 / GPIO4_2  / fephy_dbg_out10  / VIU1_DAT3 
############################VIU1_DAT3 / GPIO4_3  / fephy_dbg_out11  / VIU1_DAT4 
############################VIU1_DAT4 / GPIO4_4  / fephy_dbg_out12  / VIU1_DAT5 
############################VIU1_DAT5 / GPIO4_5  / fephy_dbg_out13  / VIU1_DAT6 
############################VIU1_DAT6 / GPIO4_6  / fephy_dbg_out14  / VIU1_DAT7 
############################VIU1_DAT7 / GPIO4_7  / fephy_dbg_out15  / VIU1_CLK  

#VGA
himm 0x200f000c 0x00000001 #GPIO2_0   / VGA_HS   //muxctrl_reg3
himm 0x200f0010 0x00000001 #GPIO1_5   / VGA_VS   //muxctrl_reg4

#AIO
himm 0x200f0014 0x00000000 #AIO_MCLK    / GPIO7_0  / BOOT_SEL  //muxctrl_reg5
himm 0x200f0018 0x00000000 #AIO_BCLK_TX / GPIO7_1              //muxctrl_reg6
himm 0x200f001c 0x00000000 #AIO_WS_TX   / GPIO7_2              //muxctrl_reg7
himm 0x200f0020 0x00000000 #AIO_SD_TX   / GPIO7_3  / JTAG_SEL  //muxctrl_reg8
himm 0x200f0024 0x00000000 #AIO_BCLK_RX / GPIO7_4              //muxctrl_reg9
himm 0x200f0028 0x00000000 #AIO_WS_RX   / GPIO7_5              //muxctrl_reg10
himm 0x200f002c 0x00000000 #AIO_SD_RX   / GPIO7_6              //muxctrl_reg11

#SPI
himm 0x200f0030 0x00000001 #GPIO8_0      / SPI_SCLK            //muxctrl_reg12
himm 0x200f0034 0x00000001 #PLL_TEST_OUT0/ SPI_SDO / PLL_TEST_OUT1/ PLL_TEST_OUT2 / GPIO8_1 //muxctrl_reg13
himm 0x200f0038 0x00000001 #GPIO8_2      / SPI_SDI             //muxctrl_reg14
himm 0x200f003c 0x00000001 #GPIO8_3      / SPI_CSN0            //muxctrl_reg15
himm 0x200f0040 0x00000001 #GPIO8_4      / SPI_CSN1/ PWM_SVB   //muxctrl_reg16   demo用PWM

#I2C
himm 0x200f0044 0x00000000 #GPIO1_6 / I2C_SDA   //muxctrl_reg17
himm 0x200f0048 0x00000000 #GPIO1_7 / I2C_SCL   //muxctrl_reg18

#UART1
#himm 0x200f004c 0x00000001 #GPIO5_0 / UART1_RTSN //muxctrl_reg19
#himm 0x200f0050 0x00000001 #GPIO5_1 / UART1_RXD  //muxctrl_reg20
#himm 0x200f0054 0x00000001 #GPIO5_2 / UART1_CTSN / PWM_SVB //muxctrl_reg21  SKT用PWM
#himm 0x200f0058 0x00000001 #GPIO5_3 / UART1_TXD  //muxctrl_reg22

#UART2
#himm 0x200f005c 0x00000001 #GPIO5_4 / UART2_RXD  //muxctrl_reg23
#himm 0x200f0060 0x00000001 #GPIO5_5 / UART2_TXD  //muxctrl_reg24   //网口PHY的复位，用GPIO来做

#IR
#himm 0x200f0064 0x00000001 #GPIO7_7 / IR_IN      //muxctrl_reg25

#USB0
#himm 0x200f0068 0x00000001 #GPIO6_0 / USB0_OVRCUR  //muxctrl_reg26
#himm 0x200f006c 0x00000001 #GPIO6_1 / USB0_PWREN   //muxctrl_reg27

#USB1
#himm 0x200f0070 0x00000001 #GPIO6_2 / USB1_OVRCUR  //muxctrl_reg28
#himm 0x200f0074 0x00000001 #GPIO6_3 / USB1_PWREN   //muxctrl_reg29

#HDMI
himm 0x200f0078 0x00000001 #GPIO6_4 / HDMI_HOTPLUG //muxctrl_reg30
himm 0x200f007c 0x00000001 #GPIO6_5 / HDMI_CEC     //muxctrl_reg31
himm 0x200f0080 0x00000001 #GPIO6_6 / HDMI_SDA     //muxctrl_reg32
himm 0x200f0084 0x00000001 #GPIO6_7 / HDMI_SCL     //muxctrl_reg33

#SATA
#himm 0x200f0088 0x00000001 #GPIO2_1 / SATA_LED_N0  //muxctrl_reg34
#himm 0x200f008c 0x00000001 #GPIO2_2 / SATA_LED_N1  //muxctrl_reg35

#ETH
#himm 0x200f0090 0x00000001 #GPIO5_6 / ETH_LED1 //muxctrl_reg36
#himm 0x200f0094 0x00000001 #GPIO5_7 / ETH_LED0  //muxctrl_reg37

#RMII
#himm 0x200f0098 0x00000001 #GPIO0_0 / RMII_CLK     //muxctrl_reg38 
#himm 0x200f009c 0x00000001 #GPIO0_1 / RMII_TX_EN   //muxctrl_reg39
#himm 0x200f00a0 0x00000001 #GPIO0_2 / RMII_TXD0    //muxctrl_reg40
#himm 0x200f00a4 0x00000001 #GPIO0_3 / RMII_TXD1    //muxctrl_reg41
#himm 0x200f00a8 0x00000001 #GPIO0_4 / RMII_CRS_DV  //muxctrl_reg42
#himm 0x200f00ac 0x00000001 #GPIO0_5 / RMII_RXD0    //muxctrl_reg43
#himm 0x200f00b0 0x00000001 #GPIO0_6 / RMII_RXD1    //muxctrl_reg44
#himm 0x200f00b4 0x00000001 #GPIO0_7 / RMII_RX_ER   //muxctrl_reg45

#UART3
#himm 0x200f00b8 0x00000001 #GPIO1_0 / UART3_TXD    //muxctrl_reg46
#himm 0x200f00bc 0x00000001 #GPIO1_1 / UART3_RXD    //muxctrl_reg47

#TEMPER_DQ
#himm 0x200f00c0 0x00000001 #GPIO1_2 / TEMPER_DQ    //muxctrl_reg48

#MDCK/MDIO
#himm 0x200f00c4 0x00000001 #GPIO1_3 / MDCK         //muxctrl_reg49
#himm 0x200f00c8 0x00000001 #GPIO1_4 / MDIO         //muxctrl_reg50