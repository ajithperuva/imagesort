
$(document).ready(function(){ 

    $('input[type=radio]').change( function() {
        var data =$('input[name="imagefixing"]:checked').val();
        console.log(data);
        $('#example-1-3 .sortable-list').sortable({
            connectWith: '#example-1-3 .sortable-list',
            placeholder: 'placeholder',
        }); 
    });

 $("#btn_save_project_name").click(function() {
        $("#add_project_name").validate({
            rules: {
                projectName: {
                    required: true
                },
              
            },
            submitHandler: function(form) {

                $.ajax({
                    url: '/save-project-name',
                    datatype: "json",
                    type: "post",
                    data: {
                        //projectName: $.trim($("#project_name").val())

                    },
                    success: function(data) {
                       console.log("hello")
                    },
                    error: function(error) {
                        console.log("Error occured.");
                    }
                });
            }


        })
    })
});

