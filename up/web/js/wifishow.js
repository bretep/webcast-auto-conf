function ShowWifi()
{
	 $.ajax({ 
       type:"GET",
	   url:"http://"+hostip+"/get_sys",
       dataType:"xml",
	   cache:false,
       success:function(data){
		 var wifi_dev_exist=$(data).find("sys").children("wifi_dev_exist").text();
		 var g4_dev_exist=$(data).find("sys").children("g4_dev_exist").text();
		 if(wifi_dev_exist==0)
	   {
		 $("#wifi").hide();
	   }
	   else
	   {
		 $("#wifi").show();
	   }
	   	 if(g4_dev_exist==0)
	   {
		 $("#g4").hide();
	   }
	   else
	   {
		 $("#g4").show();
	   }
	   }
	 });	
}