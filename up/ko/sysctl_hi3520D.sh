#!/bin/sh

# mddrc0 pri&timeout setting
himm    0x20110150       0x03f06    # ETH         
himm    0x20110154       0x03f06    # SCD         
himm    0x20110158       0x03f06    # CIPHER      
himm    0x2011015C       0x03f06    # SATA        
himm    0x20110160       0x03f06    # USB         
himm    0x20110160       0x03f06    # SFC         
himm    0x20110184       0x03f06    # IVE         
himm    0x20110164       0x03f06    # A9          
himm    0x20110168       0x03f02    # VPSS        
himm    0x2011016C       0x03f04    # TDE         
himm    0x20110170       0x03f04    # VCMP        
himm    0x20110174       0x03f06    # VOIE        
himm    0x20110178       0x03f06    # AIO         
himm    0x2011017C       0x10c02    # VEDU        
himm    0x20110180       0x03f06    # JPGE        
himm    0x20110180       0x03f06    # JPGD        
himm    0x20110184       0x03f06    # MD/ DDR_TEST
himm    0x20110188       0x10101    # VICAP       
himm    0x2011018C       0x10200    # VDP 

#mddrc order control idmap_mode
#himm 0x20110100 0xe7      #mddrc order enable mddrc idmap mode select
himm 0x20110100 0x6b       #mddrc order enable mddrc idmap mode select
#himm 0x20110020 0x784     #双ddr操作挂死问题规避

himm 0x2005003c 0x0             #0x2005003c:[15]bit,enable MDU not DDRT
himm 0x200500d8 0x3             #DDR0只使能VICAP和VDP乱序

#outstanding&lowpower
himm 0x20580000 0x0            #vicap lowpower
himm 0x20580004 0xf0f00002     #vicap outstanding
himm 0x205CCE00 0x00021220     #vdp outstanding & lowpower
himm 0x20600414 0x00640033     #vpss outstanding & lowpower
himm 0x206200a4 0x3            #vedu outstanding
himm 0x20620020 0x0            #vedu lowpower
himm 0x206600a4 0x1            #jpegu outstanding
himm 0x20660010 0x0            #jpegu lowpower
himm 0x20670040 0x70           #jpgd outstanding
#himm 0x20610844 0x00220000     #tde outstanding & lowpower
#himm 0x206b0004 0x22           #vcmp outstanding & lowpower 
himm 0x206c002c 0x7            #vda outstanding 
himm 0x20640014 0x1            #voie
#ive NO!
#sio NO!
#jpgd NO!
