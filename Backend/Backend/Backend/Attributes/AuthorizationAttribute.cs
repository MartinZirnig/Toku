using BackendInterface;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Backend.Attributes;
public class AuthorizationAttribute : ActionFilterAttribute
{
    public const string UserIdentificationKey = "uid";
    
    public override void OnActionExecuting(ActionExecutingContext context)
    {
        if (IsValid(context.HttpContext.Request.Headers))
        {
            context.Result = new 
                BadRequestObjectResult($"Cannot authenticate user.");
            return;
        }


        context.HttpContext.Items[UserIdentificationKey] = 
            context.HttpContext.Request.Headers[UserIdentificationKey];
        base.OnActionExecuting(context);
    }
    private static bool IsValid(IHeaderDictionary header) =>
        header.ContainsKey(UserIdentificationKey) 
        && !string.IsNullOrEmpty(header[UserIdentificationKey]);
}
