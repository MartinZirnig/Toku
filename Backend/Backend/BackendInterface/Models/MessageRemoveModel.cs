using Microsoft.EntityFrameworkCore.ValueGeneration.Internal;

namespace BackendInterface.Models;
public record MessageRemoveModel(
    Guid UserContext,
    uint MessageId
    );
