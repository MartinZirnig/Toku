using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace Database.Tables
{
    internal class ClassOperation : HasTimeFlag
    {
        internal uint ClassOperationId { get; set; }
        internal User User { get; set; }
        public string Description { get; set; }
        public UserInClassOperation Operation { get; set; }
    }
}
