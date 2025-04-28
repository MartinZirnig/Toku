using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Runtime.InteropServices.Marshalling;
using System.Text;
using System.Threading.Tasks;

namespace Database.Tables.Classes
{
    [Keyless]
    public class PrivateClass 
    {
        internal Class Class { get; set; }
        public List<User> Invites { get; set; }
    }
}
