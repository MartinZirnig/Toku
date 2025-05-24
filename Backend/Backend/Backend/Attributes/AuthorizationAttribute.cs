using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Org.BouncyCastle.Asn1.Ocsp;

namespace Backend.Attributes;
public sealed class AuthorizationAttribute : ActionFilterAttribute
{
    public const string UserIdentificationKey = "X-uid";

    public override void OnActionExecuting(ActionExecutingContext context)
    {
        if (!IsValid(context.HttpContext.Request.Headers))
        {
            context.Result = new
                BadRequestObjectResult($"Cannot authenticate user.");
            return;
        }


        context.HttpContext.Items[UserIdentificationKey] =
            context.HttpContext.Request.Headers[UserIdentificationKey];
        base.OnActionExecuting(context);
    }
    public static bool IsValid(IHeaderDictionary header) =>
        header.ContainsKey(UserIdentificationKey)
        && !string.IsNullOrEmpty(header[UserIdentificationKey]);

    public static Guid Authorize(HttpContext context) =>
        Guid.Parse(context.Request.Headers[UserIdentificationKey]!);


    public static Guid? GetUID(HttpContext request)
    {
        var user = request.Items[UserIdentificationKey]?.ToString();
        if (user is null)
            return null;

        if (Guid.TryParse(user, out var result))
            return result;

        return null;
    }
}
