using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Database.Tables
{
    public abstract class HasTimeFlag
    {
        internal DateTime CreatedTime { get; set; }
    }
}
