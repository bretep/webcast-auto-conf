#!/bin/sh

#VICAP
#XD1
#himm 0x2003002c  0x5520ff02   # XxD1 div4
#2X720P
#himm 0x2003002c 0x00241102  # 2x720P div2 interlave
#1X1080P
#himm 0x2003002c 0xaa240102  # 1x1080P div1
#1HD+4XD1
himm 0x2003002c 0x0524f102  # 1x720P+4xD1 div2+div4

#PWM
himm 0x20030038  0x2    # PWM  3M

#VO
#himm 0x20030034 0x00000fc0    # VO crg
#himm 0x2003003c 0x7c           # HDMI need confirm

himm 0x20030040 0x802   #VEDU & SED
himm 0x200300d4 0x8     #SCD 
himm 0x20030048 0x2     #VPSS
himm 0x20030058 0x2     #TDE
himm 0x20030060 0x2     #JPGE
himm 0x20030064 0x2     #JPGD
himm 0x20030068 0x2     #MD
himm 0x2003006c 0x2     #IVE/VAPU
himm 0x20030070 0x2     #VOIE/AENC
himm 0x20030074 0x2     #VCMP
himm 0x2003007c 0x2     #CIPHER 


#AIO
himm 0x20030080 0x010636ba   #AIP MCLK  crg32  8K*256 不与AOP0公用MCLK
himm 0x20030084 0x000636ba   #AOP0 MCLK  crg33  8K*256
himm 0x20030088 0x000636ba   #AOP1 MCLK  crg34  8K*256
himm 0x2003008c 0x00000002   #AIO总线时钟复位  crg35
himm 0x20030090 0x00005012   #AIP相关的时钟及软复位 crg36  选择主模式
himm 0x20030094 0x00005012   #AOP0相关的时钟及软复位 crg37 选择主模式
himm 0x20030098 0x00005012   #AOP1相关的时钟及软复位 crg38 选择主模式